FROM ubuntu:14.04

MAINTAINER Karim Ratib <karim@meedan.com>

# speed up build by disabling dpkg fsync
# https://github.com/phusion/baseimage-docker/blob/master/image/prepare.sh
RUN echo force-unsafe-io > /etc/dpkg/dpkg.cfg.d/02apt-speedup

RUN apt-get update --fix-missing
RUN apt-get upgrade -y

# standard
RUN apt-get install --no-install-recommends -qy git ca-certificates vim emacs24-nox screen tree htop curl tig npm

# gnu screen
RUN chmod u+s /usr/bin/screen
RUN chmod 755 /var/run/screen

# Bundle app source
COPY . /src

# Install app dependencies
RUN cd /src; npm install

CMD ["nodejs", "/src/app.js"]
