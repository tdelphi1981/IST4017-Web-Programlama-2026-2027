# statik-dinamik-istek.ps1 - Hafta 1, Unite 2 (PowerShell surumu)
#
# Ayni statik kaynagi iki kez, ayni dinamik uc noktayi iki kez isteyip
# statik cevabin degismedigini, dinamik cevabin degistigini gozlemler.
# Istekler PowerShell'in yerlesik Invoke-WebRequest komutuyla yapilir
# (bash surumundeki "curl -sS" karsiligi).
#
# Calistirma (Windows): powershell -ExecutionPolicy Bypass -File .\statik-dinamik-istek.ps1
# Calistirma (pwsh)   : pwsh ./statik-dinamik-istek.ps1

$StatikUrl = "https://example.com/"
$DinamikUrl = "https://httpbin.org/uuid"

# Verilen adrese GET istegi atar; basari durumunda cevabin govdesini,
# hata durumunda $null dondurur.
function Get-CevapGovdesi {
    param([string]$Url)
    try {
        $Cevap = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        return $Cevap.Content
    } catch {
        return $null
    }
}

Write-Host "== Statik istek: $StatikUrl (iki kez) =="

# BEGIN statik_istek
# example.com sunucudaki hazir bir HTML dosyasini oldugu gibi gonderir; iki
# ardisik istek birebir ayni govdeyi dondurmelidir.
$Istek1 = Get-CevapGovdesi -Url $StatikUrl
$Istek2 = Get-CevapGovdesi -Url $StatikUrl

if ($null -eq $Istek1 -or $null -eq $Istek2) {
    Write-Host "HATA: $StatikUrl adresine baglanilamadi. Internet baglantinizi kontrol edin." -ForegroundColor Red
} elseif ($Istek1 -ceq $Istek2) {
    Write-Host "Statik cevap iki istekte de BIREBIR AYNI (beklenen davranis)."
} else {
    Write-Host "Statik cevap iki istekte farkli cikti (beklenmiyordu)."
}
# END statik_istek

Write-Host ""
Write-Host "== Dinamik istek: $DinamikUrl (iki kez) =="

# BEGIN dinamik_istek
# httpbin.org/uuid her istekte YENIDEN URETILEN bir rastgele kimlik
# dondurur; bu yuzden iki ardisik istegin govdesi FARKLI olmalidir.
$Cevap1 = Get-CevapGovdesi -Url $DinamikUrl
$Cevap2 = Get-CevapGovdesi -Url $DinamikUrl

if ($null -eq $Cevap1 -or $null -eq $Cevap2) {
    Write-Host "HATA: $DinamikUrl adresine baglanilamadi. Internet baglantinizi kontrol edin." -ForegroundColor Red
} else {
    Write-Host "1. cevap: $($Cevap1.Trim())"
    Write-Host "2. cevap: $($Cevap2.Trim())"
    if ($Cevap1 -cne $Cevap2) {
        Write-Host "Dinamik cevap iki istekte FARKLI (beklenen davranis)."
    } else {
        Write-Host "Dinamik cevap iki istekte ayni cikti (beklenmiyordu - sunucu onbellek olabilir)."
    }
}
# END dinamik_istek
