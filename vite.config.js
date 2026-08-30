// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: [
//                 'resources/sass/app.scss',
//                 'resources/js/app.js',
//                 'resources/js/boards/App.jsx',
//             ],
//             refresh: true,
//         }),
//         react(),
//     ],
// });



// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: [
//                 'resources/sass/app.scss',
//                 'resources/js/app.js',
//                 'resources/js/boards/App.jsx',
//             ],
//             refresh: true,
//         }),

//         react(), // ← MUST BE OUTSIDE laravel()
//     ],
// });


// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: [
//                 'resources/js/boards/App.jsx',
//                 'resources/sass/app.scss',
//                 'resources/js/app.js',
//             ],
//             refresh: true,
//         }),
//         react(),
//     ],
//       server: {
//     proxy: {
//       // Cada vez que React haga un fetch a '/api/...', Vite lo reenvía automáticamente a Laravel
//       '/api': {
//         target: 'http://127.0.0.1:8000', // ⚠️ Asegurate de que sea el puerto real donde corre tu Laravel
//         changeOrigin: true,
//         secure: false,
//       }
//     }
//   }
// });




// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: [
//                 'resources/js/boards/App.jsx',
//                 'resources/sass/app.scss',
//                 'resources/js/app.js',
                
//                 // 📂 LE AVISAMOS A VITE SOBRE NUESTROS DOS SCRIPTS NUEVOS:
//                 'resources/js/simulador/google-maps-helper.js',
//                 'resources/js/simulador/flight-animator.js',
//                 'resources/js/simulador/dfs-explorer.js',
//             ],
//             refresh: true,
//         }),
//         react(),
//     ],
//     server: {
//         proxy: {
//             '/api': {
//                 target: 'http://127.0.0.1:8000',
//                 changeOrigin: true,
//                 secure: false,
//             }
//         }
//     }
// });



// import { defineConfig } from 'vite';
// import laravel from 'laravel-vite-plugin';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//     plugins: [
//         laravel({
//             input: [
//                 'resources/js/boards/App.jsx',
//                 'resources/sass/app.scss',
//                 'resources/js/app.js',
//                 'resources/js/simulador/google-maps-helper.js',
//                 'resources/js/simulador/flight-animator.js',
//                 'resources/js/simulador/dfs-explorer.js',
//             ],
//             refresh: true,
//         }),
//         react(),
//     ],
// });



import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/boards/main.jsx', // <-- DEBE SER MAIN.JSX
                'resources/sass/app.scss',
                'resources/js/app.js',
                'resources/js/simulador/google-maps-helper.js',
                'resources/js/simulador/flight-animator.js',
                'resources/js/simulador/dfs-explorer.js',
            ],
            refresh: true,
        }),
        react(),
    ],
});