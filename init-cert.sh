#!/bin/bash
CRT_FILE=$1
CRT_DATA=$2

KEY_FILE=$3
KEY_DATA=$4

CLOUDFLARE_FILE=$5
CLOUDFLARE_DATA=$6

LOCATION='etc/certs'

if [[ -z "$CRT_FILE" ]]; then
  echo "FolderName Required"
  exit 100
fi


if [ -e "${LOCATION}/${CRT_FILE}" ]; then
    echo "CRT_FILE exists"
    exit 100
else 
    echo "CREATE new CRT_FILE name: $CRT_FILE"
    file="${LOCATION}/${CRT_FILE}"
    echo -n ${CRT_DATA} > ${LOCATION}/${CRT_FILE}

    
    echo ">>> DATA in $CRT_FILE: "
    cat ${LOCATION}/${CRT_FILE}
    echo -e "\n"
fi 


if [ -e "${LOCATION}/${KEY_FILE}" ]; then
    echo "KEY_FILE exists"
    exit 100
else 
    echo "CREATE new KEY_FILE name: $KEY_FILE"
    file="${LOCATION}/${KEY_FILE}"
    echo -n ${KEY_DATA} > ${LOCATION}/${KEY_FILE}

    echo ">>> DATA in $KEY_FILE: "
    cat ${LOCATION}/${KEY_FILE}
    echo -e "\n"
fi 


if [ -e "${LOCATION}/${CLOUDFLARE_FILE}" ]; then
    echo "CLOUDFLARE_FILE exists"
    exit 100
else 
    echo "CREATE new CLOUDFLARE_FILE name: $CLOUDFLARE_FILE"
    file="${LOCATION}/${CLOUDFLARE_FILE}"
    echo -n ${CLOUDFLARE_DATA} > ${LOCATION}/${CLOUDFLARE_FILE}

    echo ">>> DATA in $CLOUDFLARE_FILE: "
    cat ${LOCATION}/${CLOUDFLARE_FILE}
    echo -e "\n"
fi 