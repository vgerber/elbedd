[Elbe DD](https://elbedd.vgerber.io) is a dashboard for elbe related information in the area of Dresden

# Getting started

```bash
mkdir cache
sudo chown -R 1001:1001 ./cache
docker run -p 3000:3000 -v ./cache:/app/cache vgerber/elbedd:latest
```

# Development

```bash
npm install
npm run dev
```

The water level and measurements are fetched from external sources which will be cached for a certain amount of time. To enable the cache usage it is necessary to fix the permissions of the cache which is usually mounted.

Therefore the docker image uses the entrypoint.sh script to ensure it can use the provided cache directory.

## Docker

```bash
docker build --build-arg VERSION=custom -t vgerber/elbedd:local .
```

```bash
mkdir cache
sudo chown -R 1001:1001 ./cache
docker run -p 3000:3000 -v ./cache:/app/cache vgerber/elbedd:local
```
