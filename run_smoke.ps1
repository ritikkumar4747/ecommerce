$base = "http://localhost:5000/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "Registering test user..."
try {
    # Use a strong password to satisfy server validator
    $reg = Invoke-RestMethod -Uri "$base/auth/register" -Method Post -Body (@{name='smoke'; email='smoke@test.local'; password='P@ssw0rd123!'} | ConvertTo-Json) -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Host "Register response:"; $reg | ConvertTo-Json
} catch {
    Write-Host "Register failed:" $_.Exception.Message
}

Write-Host "Logging in..."
try {
    $login = Invoke-RestMethod -Uri "$base/auth/login" -Method Post -Body (@{email='smoke@test.local'; password='P@ssw0rd123!'} | ConvertTo-Json) -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Host "Login response:"; $login | ConvertTo-Json
} catch {
    Write-Host "Login failed:" $_.Exception.Message
}

Write-Host "Checking authenticated /me..."
try {
    $me = Invoke-RestMethod -Uri "$base/auth/me" -Method Get -WebSession $session -ErrorAction Stop
    Write-Host "Me:"; $me | ConvertTo-Json
} catch {
    Write-Host "/me failed:" $_.Exception.Message
}

Write-Host "Fetching products..."
try {
    $products = Invoke-RestMethod -Uri "$base/products" -Method Get -WebSession $session -ErrorAction Stop
    Write-Host "Products fetched. Count:" $products.count
    $firstId = $products.products[0]._id
    Write-Host "Using product id:" $firstId
} catch {
    Write-Host "Fetch products failed:" $_.Exception.Message; exit 1
}

Write-Host "Adding to cart..."
try {
    $add = Invoke-RestMethod -Uri "$base/cart/add" -Method Post -Body (@{productId=$firstId; quantity=1} | ConvertTo-Json) -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Host "Add to cart response:"; $add | ConvertTo-Json
} catch {
    Write-Host "Add to cart failed:" $_.Exception.Message
    try {
        $resp = $_.Exception.Response
        if ($resp -ne $null) {
            $text = $resp.Content.ReadAsStringAsync().Result
            Write-Host "Response content:" $text
        }
    } catch { }
    exit 1
}

Write-Host "Fetching cart..."
try {
    $cart = Invoke-RestMethod -Uri "$base/cart" -Method Get -WebSession $session -ErrorAction Stop
    Write-Host "Cart:"; $cart | ConvertTo-Json
} catch {
    Write-Host "Fetch cart failed:" $_.Exception.Message; exit 1
}

Write-Host "Initiating checkout..."
try {
    $body = @{ shippingAddress = @{ recipientName = 'smoke'; line1 = '123 Smoke Street'; city = 'Mumbai'; postalCode = '400001'; country = 'India'; phone = '+91 9999999999' } } | ConvertTo-Json
    $order = Invoke-RestMethod -Uri "$base/orders/checkout" -Method Post -Body $body -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Host "Checkout response:"; $order | ConvertTo-Json
} catch {
    Write-Host "Checkout failed:" $_.Exception.Message; exit 1
}

Write-Host "Simulating payment verification..."
try {
    $razorOrderId = $order.razorpayOrder.id
    # Create a fake payment id
    $razorPaymentId = "pay_test_" + [int](Get-Date -UFormat %s)

    # Read backend .env to get Razorpay secret for HMAC (local-only test)
    $envPath = Join-Path -Path (Resolve-Path "$PSScriptRoot\backend") -ChildPath ".env"
    $secret = $null
    if (Test-Path $envPath) {
        $lines = Get-Content $envPath
        foreach ($l in $lines) {
            if ($l -match '^RAZORPAY_KEY_SECRET\s*=\s*(.+)$') { $secret = $matches[1].Trim() }
        }
    }

    if (-not $secret) {
        Write-Host "Razorpay secret not found in backend/.env - cannot compute signature"
        exit 1
    }

    # Compute HMAC SHA256(order_id|payment_id)
    $text = "$razorOrderId|$razorPaymentId"
    $encoding = [System.Text.Encoding]::UTF8
    $keyBytes = $encoding.GetBytes($secret)
    $textBytes = $encoding.GetBytes($text)
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = $keyBytes
    $hash = $hmac.ComputeHash($textBytes)
    $signature = -join ($hash | ForEach-Object { $_.ToString('x2') })

    $body = @{ razorpay_order_id = $razorOrderId; razorpay_payment_id = $razorPaymentId; razorpay_signature = $signature } | ConvertTo-Json
    $verify = Invoke-RestMethod -Uri "$base/orders/verify" -Method Post -Body $body -ContentType 'application/json' -WebSession $session -ErrorAction Stop
    Write-Host "Verify response:"; $verify | ConvertTo-Json
} catch {
    Write-Host "Verify failed:" $_.Exception.Message
    try { $resp = $_.Exception.Response; if ($resp) { $text = $resp.Content.ReadAsStringAsync().Result; Write-Host $text } } catch {}
}
