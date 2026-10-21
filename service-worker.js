const APP_SCOPE = new URL(self.registration.scope);
const CACHE_PREFIX = `granja:${APP_SCOPE.pathname}:`;
const CACHE_NAME = `${CACHE_PREFIX}v5`;

function belongsToApp(url) {
    return url.origin === APP_SCOPE.origin
        && url.pathname.startsWith(APP_SCOPE.pathname)
        && !url.pathname.slice(APP_SCOPE.pathname.length).startsWith('dev/');
}

const APP_FILES = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];


// ==========================================
// INSTALAÇÃO
// ==========================================
self.addEventListener('install', event => {

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_FILES))
    );

    self.skipWaiting();
});


// ==========================================
// ATIVAÇÃO
// ==========================================
self.addEventListener('activate', event => {

    event.waitUntil(
        caches.keys().then(keys => {

            return Promise.all(
                keys
                    .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );

        }).then(() => {

            return self.clients.claim();

        })
    );
});


// ==========================================
// REQUISIÇÕES
// ==========================================
self.addEventListener('fetch', event => {

    const request = event.request;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (!belongsToApp(url)) return;


    // ==========================================
    // INDEX.HTML
    // ==========================================
    if (
        request.mode === 'navigate' ||
        url.pathname.endsWith('/index.html')
    ) {

        event.respondWith(

            caches.open(CACHE_NAME).then(cache => cache.match('./index.html'))
                .then(cached => {

                    // Se já existe uma versão em cache,
                    // entrega imediatamente.
                    if (cached) {

                        // Verifica atualização em segundo plano.
                        event.waitUntil(atualizarIndex());

                        return cached;
                    }

                    // Primeira instalação:
                    // ainda não existe cache.
                    return fetch(request)
                        .then(async response => {

                            if (response.ok) {

                                const copy = response.clone();

                                await caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put('./index.html', copy);
                                    });
                            }

                            return response;
                        });

                })
        );

        return;
    }


    // ==========================================
    // OUTROS ARQUIVOS
    // ==========================================
    event.respondWith(

        caches.open(CACHE_NAME).then(cache => cache.match(request))
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(request)
                    .then(async response => {

                        if (response.ok) {

                            const copy = response.clone();

                            await caches.open(CACHE_NAME)
                                .then(cache => {
                                    cache.put(request, copy);
                                });
                        }

                        return response;

                    });

            })
    );

});


// ==========================================
// VERIFICAR NOVA VERSÃO
// ==========================================
async function atualizarIndex() {

    try {

        // Busca a versão atual da Internet.
        // cache: 'no-cache' força uma verificação
        // com o servidor.
        const response = await fetch('./index.html', {
            cache: 'no-cache'
        });

        if (!response.ok) return;


        // Lê a versão que veio da Internet.
        const novoIndex = await response.clone().text();


        // Abre o cache atual.
        const cache = await caches.open(CACHE_NAME);


        // Pega a versão atualmente armazenada.
        const antigoResponse = await cache.match('./index.html');

        if (!antigoResponse) {

            await cache.put('./index.html', response.clone());

            return;
        }


        // Lê a versão antiga.
        const antigoIndex = await antigoResponse.text();


        // ==========================================
        // COMPARA AS DUAS VERSÕES
        // ==========================================
        if (novoIndex !== antigoIndex) {

            // A versão realmente mudou.
            // Salva a nova versão no cache.
            await cache.put(
                './index.html',
                new Response(novoIndex, {
                    headers: {
                        'Content-Type': 'text/html; charset=UTF-8'
                    }
                })
            );


            // ==========================================
            // AVISA O APP ABERTO
            // ==========================================
            const clients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: false
            });

            clients.forEach(client => {
                if (!belongsToApp(new URL(client.url))) return;

                client.postMessage({
                    type: 'APP_UPDATED'
                });

            });

        }

    } catch (error) {

        // Sem internet ou conexão ruim.
        // Não faz absolutamente nada.
        console.log('Verificação de atualização não disponível.');

    }

}
