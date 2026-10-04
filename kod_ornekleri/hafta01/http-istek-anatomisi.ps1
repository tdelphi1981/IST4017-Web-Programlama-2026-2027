# http-istek-anatomisi.ps1 - Hafta 1, Unite 4 (PowerShell surumu)
#
# curl -v ile tam bir GET isteginin gidis-donus basliklarini; kucuk bir
# JSON govdeli POST isteginin cevabini gosterir. GET tarafinda basliklarin
# ham halini gorebilmek icin curl.exe kullanilir; POST tarafinda ise
# PowerShell'in yerlesik Invoke-RestMethod komutu gosterilir.
#
# Calistirma (Windows): powershell -ExecutionPolicy Bypass -File .\http-istek-anatomisi.ps1
# Calistirma (pwsh)   : pwsh ./http-istek-anatomisi.ps1

Write-Host "== GET istegi (curl -v ile giden/gelen basliklar) =="

# BEGIN get_istek_v
# "> " ile baslayan satirlar giden istegi (istek satiri + basliklar), "< "
# ile baslayan satirlar gelen cevabi (durum satiri + basliklar) gosterir.
# PowerShell'de "curl" adi Invoke-WebRequest'in takma adi olabilecegi icin
# gercek programi "curl.exe" olarak cagiriyoruz.
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    Write-Host "HATA: 'curl.exe' bulunamadi (Windows 10 1803+ ile hazir gelir)." -ForegroundColor Red
} else {
    $GetCikti = & curl.exe -sS -v -m 10 --http1.1 "https://httpbin.org/get" 2>&1 |
        ForEach-Object { $_.ToString() }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HATA: httpbin.org/get adresine baglanilamadi. Internet baglantinizi kontrol edin." -ForegroundColor Red
    } else {
        $GetCikti | Select-String -Pattern "^(> |< )" | ForEach-Object { $_.Line }
    }
}
# END get_istek_v

Write-Host ""
Write-Host "== POST istegi (JSON govde) =="

# BEGIN post_istek_govde
# -Body ile verilen JSON, istegin GOVDESINDE gonderilir; httpbin bu govdeyi
# "json" alaninda aynen geri yansitir - GET'in aksine POST'un govdesi doludur.
# Invoke-RestMethod, JSON cevabi otomatik olarak nesneye cevirir; ekrana
# yine JSON olarak basmak icin ConvertTo-Json kullaniyoruz.
try {
    $PostCevap = Invoke-RestMethod -Uri "https://httpbin.org/post" -Method Post `
        -ContentType "application/json" `
        -Body '{"ogrenci":"KTU","hafta":1}' `
        -TimeoutSec 10 -ErrorAction Stop
    $PostCevap | ConvertTo-Json -Depth 5
} catch {
    Write-Host "HATA: httpbin.org/post adresine baglanilamadi. Internet baglantinizi kontrol edin." -ForegroundColor Red
}
# END post_istek_govde
