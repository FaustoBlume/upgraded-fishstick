// Ambiente de development/testing

// Seteado en angular.json, linea 68:
// "defaultConfiguration": "development"

// Esa linea del angular.json activa la configuraciÃ³n seteada justo arriba,
// de nombre "development" (linea 53), que setea este
// archivo de ambiente por sobre el default, que es el environment.ts
// (fileReplacement, linea 60)

export const environment = {
    production: true,
    firebase : {
        apiKey: "AIzaSyBOx4_WT-1gMEHLOevcn8Xy_ODsgG4LsDA",
        authDomain: "mysoli-cb4e8.firebaseapp.com",
        databaseURL: "https://mysoli-cb4e8-default-rtdb.firebaseio.com/",
        projectId: "mysoli-cb4e8",
        storageBucket: "mysoli-cb4e8.appspot.com",
        messagingSenderId: "571703880548",
        appId: "1:571703880548:web:ec781f390e24a588b66871"
      }
};
