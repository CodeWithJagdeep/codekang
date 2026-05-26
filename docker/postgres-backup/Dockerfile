FROM alpine:3.19
RUN apk add --no-cache postgresql16-client bash
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh && \
    echo "0 2 * * * /usr/local/bin/backup.sh >> /var/log/pg-backup.log 2>&1" | crontab -
VOLUME ["/backups"]
CMD ["crond", "-f", "-d", "8"]
