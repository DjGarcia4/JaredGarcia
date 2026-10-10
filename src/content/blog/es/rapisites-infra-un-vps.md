---
title: "Cómo publico +80 sitios desde un solo VPS"
description: "La infraestructura de RapiSites: subdominios y dominios propios con HTTPS automático, publicación atómica y rollback, todo en un VPS con Docker."
date: 2026-10-20
tags: [infraestructura, rapisites, devops]
projects: [rapisites]
draft: true
---

<!-- BORRADOR: esqueleto para completar con tu experiencia. Mientras tenga
     draft: true, solo se ve con `npm run dev`. Al publicarlo, sacá el draft,
     poné la fecha real y agregá la versión en inglés en en/ con el mismo
     nombre de archivo. -->

## El problema

<!-- Qué necesitaba resolver: cada sitio en su subdominio o en el dominio
     del cliente, con HTTPS, sin pagar por un hosting por sitio. -->

## Caddy y los certificados on-demand

<!-- Wildcard para *.rapisites.com + on-demand TLS para dominios propios.
     Cómo evitás que cualquiera te haga emitir certificados (el endpoint
     de "ask"). Un fragmento del Caddyfile. -->

## Publicación atómica

<!-- Auditoría SEO previa, snapshot congelado, historial de versiones y
     rollback en un click. Por qué "atómica": qué pasaba antes. -->

## Lo que corre en el VPS

<!-- Docker, PostgreSQL + Drizzle, pg-boss para colas, R2 para archivos,
     backups cifrados, Sentry y BetterStack. Qué tan grande es el VPS. -->

## Lo que haría distinto
