#!/bin/bash

#
# To view Redis-CLI:
# docker exec -it DOCKER_CONTAINER_ID redis-cli
#

# =============================================================================
# = CONSTANTS
# =============================================================================
RUN=bash

# Image for the Redis Service
REDIS_IMAGE=redis:3.2.3

# Main port for Redis
REDIS_PORT=(6379)

# Docker image name
REDIS_NAME=redis

# =============================================================================
# = CLI OPTIONS
# =============================================================================

VERBOSE=true
DO_START=true

# =============================================================================
# = HELPER FUNCTIONS
# =============================================================================
print_info() {
    echo "$@"
}

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo "$@"
    fi
}

generate_port_string() {
    local __array=(${!1})

    local result=""
    for i in "${!__array[@]}"; do
        result="$result -p ${__array[$i]}:${__array[$i]}"
    done

    echo "$result"
}

generate_start_command() {
    local __name=$1
    local __image=$2
    local __ports="${!3}"
    local __result=$4

    local port_string=$(generate_port_string __ports[@])

    echo "docker run -d $port_string --name=$__name $__image"
}

start() {
    local cmd=""
    local container=$(docker ps --all -q)
    
    if [ $container ]; then
        echo "Stopping and exiting $container"
        cmd=$(docker stop $container)
        print_verbose "Using command: $cmd"
        cmd=$(docker rm $container)
        print_verbose "Using command: $cmd"
    fi
    
    print_info "Starting $REDIS_IMAGE as $REDIS_NAME"
    cmd=$(generate_start_command $REDIS_NAME $REDIS_IMAGE REDIS_PORT[@])
    print_verbose "Using command: $cmd"
    print_info "Result: $($cmd)"
    cmd=$(redis-server --port 6379)
}

echo "Creating and Starting up Redis Container..."
start