FROM ubuntu:14.04

MAINTAINER Karim Ratib <karim@meedan.com>

# speed up build by disabling dpkg fsync
# https://github.com/phusion/baseimage-docker/blob/master/image/prepare.sh
RUN echo force-unsafe-io > /etc/dpkg/dpkg.cfg.d/02apt-speedup

RUN apt-get update --fix-missing
RUN apt-get upgrade -y
RUN apt-get install --no-install-recommends -qy git ca-certificates vim emacs24-nox screen tree htop curl tig npm supervisor
RUN chmod u+s /usr/bin/screen
RUN chmod 755 /var/run/screen

COPY . /app
RUN mkdir -p /app/logs
RUN cd /app; npm install

CMD ["/usr/bin/supervisord", "-c", "/app/supervisord.conf"]
