var ua = window.navigator.userAgent;
if (/Mobile|iP(hone|ad)|Android|BlackBerry|IEMobile/.test(ua)) {
    window.location.href = "mobile.html";
}