// Firebase 설정 - 실제 프로젝트 설정으로 교체하세요
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAZBsZGa_oibrh9sZwZSvmxMKmzWd8rI88",
  authDomain: "difains.github.io",
  projectId: "budget-c37e0",
  storageBucket: "budget-c37e0.firebasestorage.app",
  messagingSenderId: "110975779165",
  appId: "1:110975779165:web:02527ddf64bfa0df9728b4",
  measurementId: "G-RBSW0ZJF6C"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// 데이터베이스 참조
const database = firebase.database();
const auth = firebase.auth();
