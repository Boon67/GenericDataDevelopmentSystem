#!/bin/bash
if [ "$EUID" -ne 0 ]
  then 
  	echo "---------Permissions Error---------"
  	echo "STOPPING: Please run as root or sudo"
  	echo "-----------------------------------"
  exit
fi

SCRIPTDIR="${0%/*}"

CONFIGFILENAME="adapterconfig.txt"
source "$SCRIPTDIR/$CONFIGFILENAME"

echo "Adapter Service Name: $ADAPTERSERVICENAME"
echo "SystemD Path: $SYSTEMDPATH"
echo "Python File: $PYTHONFILE"
echo "Python Bin: $PYTHONBIN"

#Ensure files are executable
echo "------Setting Executable Flag"
chmod +x "./"

#Clean up any old adapter stuff
echo "------Cleaning Up Old Adapter"
sudo systemctl stop $ADAPTERSERVICENAME
sudo systemctl disable $ADAPTERSERVICENAME
sudo rm $SYSTEMDPATH/$ADAPTERSERVICENAME
sudo apt autoremove -y
systemctl daemon-reload

#Create a systemd service
echo "------Configuring Service"
cat >"$SYSTEMDPATH/$ADAPTERSERVICENAME" <<EOF
[Unit]
Description=$ADAPTERSERVICENAME

[Service]
Type=simple
ExecStart=$PYTHONBIN $PWD/$PYTHONFILE
Restart=on-abort
TimeoutSec=30
RestartSec=30
StartLimitInterval=350
StartLimitBurst=10

[Install]
WantedBy=multi-user.target 
EOF
echo "-----Install Pre-requisite sofware"
#Requires build tools for pip and commands need to run at eleveated privledge
apt-get install build-essential -y
apt-get install libglib2.0-dev -y
pip install pip --upgrade 
pip install bluepy --upgrade 
pip install clearblade --upgrade

echo "------Reloading daemon"
systemctl daemon-reload
#Enable the adapter to start on reboot Note: remove this if you want to manually maintain the adapter
echo "------Enabling Startup on Reboot"
systemctl enable "$ADAPTERSERVICENAME"
systemctl start "$ADAPTERSERVICENAME"
echo "------ Adapter Deployed"
cat $SYSTEMDPATH/$ADAPTERSERVICENAME
