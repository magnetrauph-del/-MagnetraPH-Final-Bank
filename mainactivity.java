// FILE: MainActivity.java - ID: APK-WRAP-PRO - LOCK: OWNER SEALED
package com.magnetraph.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.FirebaseApp;
import com.google.firebase.appcheck.FirebaseAppCheck;
import com.google.firebase.appcheck.playintegrity.PlayIntegrityAppCheckProviderFactory;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        FirebaseApp.initializeApp(this);
        FirebaseAppCheck firebaseAppCheck = FirebaseAppCheck.getInstance();
        firebaseAppCheck.installAppCheckProviderFactory(
            PlayIntegrityAppCheckProviderFactory.getInstance()
        );
        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        webView.setWebViewClient(new WebViewClient(){
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url){
                return false;
            }
        });
        webView.addJavascriptInterface(new JsBlocker(),"AndroidBlock");
        webView.loadUrl("https://magnetra-ultra.firebaseapp.com/dashboard.html");
        setContentView(webView);
    }
    @Override
    public void onBackPressed(){
        if(webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    public class JsBlocker{
        @android.webkit.JavascriptInterface
        public boolean isDebug(){ return false; }
    }
}
