package com.magnetraph.ultra;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
private WebView webView;
private String HOME = "https://magnetra-ultra.web.app/dashboard.html";

@Override
protected void onCreate(Bundle savedInstanceState) {
super.onCreate(savedInstanceState);
webView = new WebView(this);
setContentView(webView);

WebSettings settings = webView.getSettings();
settings.setJavaScriptEnabled(true);
settings.setDomStorageEnabled(true);
settings.setAllowFileAccess(false);
settings.setAllowContentAccess(false);
settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

webView.setWebViewClient(new WebViewClient(){
@Override
public boolean shouldOverrideUrlLoading(WebView view, String url){
if(url.contains("magnetra-ultra.web.app")){
view.loadUrl(url);
return true;
}
return false;
}
});

if(getIntent().getData()!=null){
String deep = getIntent().getData().toString();
if(deep.contains("magnetra-ultra.web.app")){
webView.loadUrl(deep);
} else {
webView.loadUrl(HOME);
}
} else {
webView.loadUrl(HOME);
}
}

@Override
public void onBackPressed(){
if(webView.canGoBack()){
webView.goBack();
} else {
super.onBackPressed();
}
}
}
