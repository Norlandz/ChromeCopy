So Dify is occupying:

```
http://localhost
https://localhost
```

To stop it:

```bash
cd /srv/dify_wsp/dify_repo/docker
docker compose -p dify_docker_instance down
```

That frees the ports.

## 3\. Better for local dev: change the port

For WSL/dev, do not let Dify own root `localhost:80`.

Change your `.env.prod`:

```env
EXPOSE_NGINX_PORT=8088
EXPOSE_NGINX_SSL_PORT=8443
```

Then sync/deploy again.