#!/usr/bin/env python
from bluepy.btle import *
import argparse
import binascii
import struct, time, datetime, json, logging, os, socket, sys
from clearblade.ClearBladeCore import System, Query, Developer
from clearblade.ClearBladeCore import cbLogs


ADAPTERNAME="bleAdapter"
ADAPTERKEY="123456789"
LOGLEVEL = "INFO"
#Device/type/id
TOPIC = "device/ble/"
cbLogs.DEBUG = False
cbLogs.MQTT_DEBUG = False
mqtt=""
WL={} #Whitelist
SC={} #Schema

class ScanDelegate(DefaultDelegate):
    def __init__(self):
        DefaultDelegate.__init__(self)

    def handleDiscovery(self, dev, isNewDev, isNewData):
        if isNewDev:
            try:
                devData=dict()
                logging.debug("Discovered device %s", dev.addr)
                #Iterate through the advertised values
                #if dev.connectable:
                #   devData['operation_details']=processDevice(dev)
                for (adtype, desc, value) in dev.getScanData():
                    devData[desc]=value
                devData['edgename'] = socket.gethostname()
                devData['rssi']=dev.rssi
                devData['deviceid']=dev.addr
                devData['connectable']=dev.connectable
                logging.debug("    %s", json.dumps(devData))
                mqtt.publish(TOPIC + "scan/" + dev.addr, json.dumps(devData))
            finally:
                pass
        elif isNewData:
            logging.debug("Received new data from %s", dev.addr)

    def scanProcess(self, time):
        scanner = Scanner().withDelegate(ScanDelegate())
        scanner.clear()
        devices = scanner.scan(time)
        return devices      

def processDeviceList(devices):
    for dev in devices:
        processDevice(dev)

def processDevice(dev, schema):
    try:
        sc=json.loads(schema)
        details=dict()
        logging.debug("Device Address: %s", dev.addr)
        p=Peripheral()
        #try:
        logging.debug("Connecting to %s", dev.addr)
        p.connect(dev.addr)
        logging.info("Connected %s", dev.addr)
        details["deviceid"]=dev.addr
        details["device_name"]=dev.getValueText(0x09)
        for prop in sc:
            logging.debug("SVC: %s CHAR: %s NAME:%s TYPE:%s", prop["svcid"], prop["propid"], prop["name"],prop["type"])
            s=p.getServiceByUUID(prop["svcid"])
            char=s.getCharacteristics(prop["propid"])
            for c in char:
                if c.supportsRead():
                    v=c.read()
                    if prop["type"]=="ord":
                        v=ord(v)
                    if prop["type"]=="long":
                        v=struct.unpack('<L', v)[0]
                    elif prop["type"]=="unsigned short":
                        v=struct.unpack('<H', v)[0]
                    elif prop["type"]=="short":
                        v=struct.unpack('<h', v)[0]
                    elif prop["type"]=="raw":
                        pass
                    details[prop["name"]]= v
        p.disconnect()
        mqtt.publish(TOPIC + "data/" + dev.addr, json.dumps(details))
        logging.info("%s Disconnected", dev.addr)
    except:
        logging.info("Unable to connect %s", dev.addr)
        details['connection']="Unable to Connect"
    finally:
        logging.info(json.dumps(details))
    return details

def setup_custom_logger(name):
    formatter = logging.Formatter(fmt='%(asctime)s %(levelname)-8s %(message)s',datefmt='%m-%d-%Y %H:%M:%S %p')
    handler = logging.StreamHandler(stream=sys.stdout)
    handler.setFormatter(formatter)
    logger = logging.getLogger(name)
    logging.basicConfig(level=os.environ.get("LOGLEVEL", LOGLEVEL))
    logger.addHandler(handler)
    return logger

#Main Loop
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-i', '--hci', action='store', type=int, default=0,
                        help='Interface number for scan')
    parser.add_argument('-t', '--timeout', action='store', type=int, default=10,
                        help='Scan delay, 0 for continuous')
    parser.add_argument('-d', '--devicedetails', action='store', default=False,
                        help='Get Device Details During Scan')
    parser.add_argument('-sk', '--systemkey', action='store', type=str, default="aab189b30bcaf7b4fdd991aff210",
                        help='System Key for connectivity')
    parser.add_argument('-ss', '--systemsecret', action='store', type=str, default="AAB189B30BD0F8C5E98DD3CBF456",
                        help='System Secret for connectivity')
    parser.add_argument('-su', '--systemurl', action='store', type=str, default="http://localhost:9000",
                        help='System URL for connectivity')
    parser.add_argument('-an', '--adaptername', action='store', type=str, default="bleAdapter",
                        help='Adapter Device Name')
    parser.add_argument('-ak', '--adapterkey', action='store', type=str, default="123456789",
                        help='Adapter Device Key')
    parser.add_argument('-tp', '--topic', action='store', type=str, default="device/ble/",
                        help='Adapter Device Key')
    parser.add_argument('-sc', '--schematable', action='store', type=str, default="dev_admin_devicetypes",
                        help='Device Schema Collection')
    parser.add_argument('-dw', '--devicewhitelist', action='store', type=str, default="dev_whitelist",
                        help='Device Whitelist Collection')

    arg = parser.parse_args(sys.argv[1:])
    TOPIC=arg.topic
    logger = setup_custom_logger('BLE Adapter')
    scanner=ScanDelegate()
    exitapp=False
    cbSystem=System(arg.systemkey, arg.systemsecret, arg.systemurl)
#    cbAuth=cbSystem.User(CBUSER, CBPASS)
    cbAuth=cbSystem.Device(arg.adaptername, arg.adapterkey)
    mqtt=cbSystem.Messaging(cbAuth)
    
    mqtt.connect() #Connect to the msg broker
    while not exitapp:
        dev={}
        #List of devices to schema and devices monitor
        whitelisttable = cbSystem.Collection(cbAuth, collectionName=arg.devicewhitelist)
        wl_rows = whitelisttable.getItems()   
        schematable = cbSystem.Collection(cbAuth, collectionName=arg.schematable)
        schema_rows = schematable.getItems()
        for row in schema_rows:
            SC[row["item_id"]]=row["schema"]
        for row in wl_rows:
            WL[row["device_id"]]=SC[row["devicetype"]]
            #if "00:0b:57:1a:8f:de" in wl:
        logging.debug("Whitelist: %s", WL)
        logging.info("Scan Period: %s seconds", arg.timeout)
        devices=scanner.scanProcess(arg.timeout)
        try:
            for d in devices:
                #print d.getScanData()
                if d.addr in WL:
                    processDevice(d, WL[d.addr])
            #    if d.addr in wl:
            #        logging.info("Device Addr: %s", d.addr)
            #      logging.info("Device Schema: %s", wl[d.addr])
            #       processDevice(d.addr, json.load(wl[d.addr]))

        except KeyboardInterrupt:
            exitapp = True
            mqtt.disconnect()
            os._exit(0)
            raise
        except Exception as e:
            logging.info ("EXCEPTION:: %s", str(e))
        finally:
            logging.info('Scan Cycle Complete: %s', datetime.datetime.now().strftime('%m-%d-%Y %H:%M:%S'))