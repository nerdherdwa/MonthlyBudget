FROM httpd:2.4
LABEL maintainer="michael.l.horsfall@gmail.com"

COPY . /usr/local/apache2/htdocs/
EXPOSE 80