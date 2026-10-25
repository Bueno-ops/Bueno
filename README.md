# Rotas Inteligentes

Aplicação web progressiva (PWA) de rotas e navegação, com mapa interativo, navegação passo a passo, alertas de trânsito, pontos de interesse e suporte a três idiomas.

## Acessar

| Onde | Endereço |
|---|---|
| **App online** | https://bueno-ops.github.io/Bueno/ |
| **APK / Releases** | https://github.com/Bueno-ops/Bueno/releases/latest |
| **Repositório** | https://github.com/Bueno-ops/Bueno |

> Use a URL com `https://` e com a barra no final (`/Bueno/`).

## Instalar no celular

1. **Pelo navegador (recomendado):** abra o site no Chrome → menu ⋮ → **Instalar app** (ou *Adicionar à tela inicial*).
2. **Por APK:** baixe o `app-release.apk` em [Releases](https://github.com/Bueno-ops/Bueno/releases/latest) e abra no Android (autorize "instalar apps de fontes desconhecidas" se pedir).

## Funcionalidades

- Mapa interativo com 3 estilos: OpenStreetMap, noturno (CARTO) e satélite (Esri)
- Rotas via OSRM com até 3 alternativas, animação e re-roteamento
- Modos: Carro, Moto, Bike e A pé (com cálculo de tempo por modo)
- Origem por busca, GPS, marcador arrastável ou seletor hierárquico (continente → país → estado)
- Navegação passo a passo com modo motorista, instruções e distância/tempo restantes
- Paradas intermediárias (waypoints)
- Pontos de interesse (posto, restaurante, estacionamento, hotel)
- Trânsito: zonas conhecidas, notificações e reporte de incidentes
- Favoritos, histórico de rotas e buscas recentes
- Compartilhamento da rota em texto ou imagem
- Custo estimado da viagem (consumo e preço do combustível)
- Tema escuro e i18n (Português, English, Español)
- Funciona offline (Service Worker)

## Rodar localmente

Em Windows, dê dois cliques em `abrir-app.bat` — ele sobe um servidor local e abre
`http://localhost:8099/app.html` no navegador.

Em qualquer sistema com Python:

```bash
python -m http.server 8099
# abra http://localhost:8099/app.html
```

Abrir o `app.html` direto pelo `file://` funciona parcialmente, mas o Service Worker,
a instalação como app e o GPS só funcionam via `http://localhost` ou `https://`.

## Estrutura

```
app.html             ← aplicação (HTML + CSS + JS, single-file)
sw.js                ← Service Worker (cache/offline)
manifest.json        ← manifest PWA
index.html           ← redireciona para app.html
icon.svg, icon-*.png ← ícones
servidor-local.ps1   ← servidor HTTP local (PowerShell)
abrir-app.bat        ← atalho para o servidor local
android/             ← projeto Android (TWA, gerado pelo Bubblewrap)
.github/workflows/build-apk.yml ← CI: build do APK/AAB e release
```

## Android (APK)

O APK é uma TWA (Trusted Web Activity) que abre o site em tela cheia. O build automático
roda no GitHub Actions a cada push e publica os artefatos; ao criar uma tag `v*` também
é criada uma Release com o APK e o AAB anexados.

Assinatura: o CI usa a keystore do projeto, guardada nos secrets
`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS` e `KEY_PASSWORD`.
Manter essa keystore é o que permite instalar uma versão nova por cima da anterior.

```powershell
# build local (precisa de JDK 17 + Android SDK)
.\build-android.ps1
```

## Tecnologias

- HTML5, CSS3 e JavaScript (ES6+), sem framework
- [Leaflet](https://leafletjs.com/) 1.9.4
- [OSRM](https://project-osrm.org/) (`router.project-osrm.org`) para rotas
- [Nominatim](https://nominatim.org/) para geocoding
- Service Worker + Web App Manifest (PWA)
- GitHub Pages (hospedagem) e GitHub Actions (build Android)

## Licença

Projeto privado — todos os direitos reservados.
