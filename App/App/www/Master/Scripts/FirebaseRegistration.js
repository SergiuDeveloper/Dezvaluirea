class FirebaseRegistration {
    static async Register() {
        var firebaseConfig = {
            apiKey: "AIzaSyBAEFfxPoUnW3DW5YW1jjHcnwq76pslfVI",
            authDomain: "dezvaluireaapp.firebaseapp.com",
            databaseURL: "https://dezvaluireaapp.firebaseio.com",
            projectId: "dezvaluireaapp",
            storageBucket: "dezvaluireaapp.appspot.com",
            messagingSenderId: "734353967915",
            appId: "1:734353967915:android:c7f9f60936a4becf20536e"
        };
    
        firebase.initializeApp(firebaseConfig);
    }
}