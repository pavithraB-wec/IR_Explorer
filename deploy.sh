#!/bin/bash
set -e 
# Usage: deploy.sh

# Define cleanup function for exit
cleanup() {
    # Kill the icp-cli network process if it's running
    icp network stop
    exit $1
}

# Handle script interruption
trap 'cleanup 1' INT TERM


icp network start -d
icp canister create --environment local frontend
icp canister create --environment local backend
export BACKEND_CANISTER_ID=$(icp canister settings show --environment local --id-only backend)
export STORAGE_GATEWAY_URL=http://localhost:6188
export II_URL=http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:8000

icp deploy --environment local frontend backend


echo "Press Ctrl+C to stop the deployment and exit."
# This loop keeps the script running until interrupted by Ctrl+C.
while true; do
    sleep 2
done