function Extract-Docx {
    param($path)
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
    $entry = $zip.GetEntry('word/document.xml')
    $stream = $entry.Open()
    $reader = New-Object System.IO.StreamReader($stream)
    $xml = $reader.ReadToEnd()
    $reader.Dispose()
    $zip.Dispose()
    $text = [regex]::Replace($xml, '<[^>]+>', ' ')
    $text = [regex]::Replace($text, '\s+', ' ')
    return $text.Trim()
}

$prd = Extract-Docx 'd:\Project1\PRD.docx'
$design = Extract-Docx 'd:\Project1\DesignDoc.docx'
$tech = Extract-Docx 'd:\Project1\TecStack.docx'

"=== PRD ===" | Out-File -FilePath 'd:\Project1\docs_extracted.txt' -Encoding UTF8
$prd | Out-File -FilePath 'd:\Project1\docs_extracted.txt' -Append -Encoding UTF8
"`n=== DESIGN DOC ===" | Out-File -FilePath 'd:\Project1\docs_extracted.txt' -Append -Encoding UTF8
$design | Out-File -FilePath 'd:\Project1\docs_extracted.txt' -Append -Encoding UTF8
"`n=== TECH STACK ===" | Out-File -FilePath 'd:\Project1\docs_extracted.txt' -Append -Encoding UTF8
$tech | Out-File -FilePath 'd:\Project1\docs_extracted.txt' -Append -Encoding UTF8

Write-Host "Extraction complete. File saved."
