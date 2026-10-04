# dns-port-kesif.ps1 - Hafta 1, Unite 1 (PowerShell surumu)
#
# Bir alan adinin IP adresine nasil cozumlendigini (DNS) ve curl'un fiilen
# hangi IP:port ikilisine baglandigini gozlemler.
#
# Platform notu: Windows'ta DNS cozumleme icin yerlesik "Resolve-DnsName"
# komutu kullanilir (bash surumundeki "dig +short" karsiligi). macOS/Linux
# uzerindeki PowerShell'de (pwsh) Resolve-DnsName bulunmaz; orada .NET'in
# Dns sinifi ile ayni sonuc alinir. curl.exe, Windows 10 1803'ten beri
# sistemle birlikte gelir.
#
# Calistirma (Windows): powershell -ExecutionPolicy Bypass -File .\dns-port-kesif.ps1
# Calistirma (pwsh)   : pwsh ./dns-port-kesif.ps1

$AlanAdi = "www.example.com"

Write-Host "== DNS cozumleme: $AlanAdi =="

# BEGIN dns_cozumleme
# Resolve-DnsName -Type A yalnizca A (IPv4) kayitlarini getirir; asagida
# sadece IP adresleri basilir - "dig +short" ciktisiyla ayni ozet.
try {
    if (Get-Command Resolve-DnsName -ErrorAction SilentlyContinue) {
        Resolve-DnsName -Name $AlanAdi -Type A -ErrorAction Stop |
            Where-Object { $_.Type -eq 'A' } |
            ForEach-Object { $_.IPAddress }
    } else {
        # macOS/Linux pwsh: Resolve-DnsName yok, .NET ile cozumle.
        [System.Net.Dns]::GetHostAddresses($AlanAdi) |
            Where-Object { $_.AddressFamily -eq 'InterNetwork' } |
            ForEach-Object { $_.IPAddressToString }
    }
} catch {
    Write-Host "HATA: '$AlanAdi' cozumlenemedi. Internet/DNS baglantinizi kontrol edin." -ForegroundColor Red
}
# END dns_cozumleme

Write-Host ""
Write-Host "== Port gozlemi: curl -v ile baglanti satiri =="

# BEGIN port_gozlemi
# curl -v ciktisinin "Connected to ... port ..." satiri, tarayicinin/curl'un
# DNS'ten aldigi IP adresine hangi porttan (https icin varsayilan 443)
# baglandigini gosterir. PowerShell'de "curl" adi Invoke-WebRequest'in
# takma adi olabilecegi icin gercek programi "curl.exe" olarak cagiriyoruz.
if (-not (Get-Command curl.exe -ErrorAction SilentlyContinue)) {
    Write-Host "HATA: 'curl.exe' bulunamadi (Windows 10 1803+ ile hazir gelir)." -ForegroundColor Red
} else {
    $NullAygit = if ($env:OS -eq 'Windows_NT') { 'NUL' } else { '/dev/null' }
    $CurlCikti = & curl.exe -sS -v -m 10 "https://$AlanAdi" -o $NullAygit 2>&1 |
        ForEach-Object { $_.ToString() }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "HATA: https://$AlanAdi adresine baglanilamadi (curl kodu: $LASTEXITCODE). Internet baglantinizi kontrol edin." -ForegroundColor Red
    } else {
        $CurlCikti | Select-String -Pattern "Connected to" | ForEach-Object { $_.Line }
    }
}
# END port_gozlemi
