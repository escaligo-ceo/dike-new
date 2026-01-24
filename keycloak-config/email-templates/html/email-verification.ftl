<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica la tua email - ${realmDisplayName!"Dike"}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        .content {
            padding: 40px 30px;
            line-height: 1.6;
        }
        .content h2 {
            color: #333;
            margin-top: 0;
            font-size: 24px;
            font-weight: 400;
        }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin: 20px 0;
            text-align: center;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #ddd, transparent);
            margin: 30px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                width: 100% !important;
            }
            .content, .header, .footer {
                padding: 20px !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ ${realmDisplayName!"Dike"}</h1>
        </div>
        
        <div class="content">
            <h2>Ciao ${user.firstName!""}!</h2>
            
            <p>Grazie per esserti registrato su <strong>${realmDisplayName!"Dike"}</strong>.</p>
            
            <p>Per completare la registrazione e attivare il tuo account, clicca sul pulsante qui sotto per verificare il tuo indirizzo email:</p>
            
            <div style="text-align: center;">
                <a href="${link}" class="button">
                    ✉️ Verifica Email
                </a>
            </div>
            
            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #666;">
                <strong>⚠️ Importante:</strong> Questo link scadrà tra <strong>${linkExpirationFormatter(linkExpiration)}</strong>.
            </p>
            
            <p style="font-size: 14px; color: #666;">
                Se il pulsante non funziona, copia e incolla questo link nel tuo browser:<br>
                <a href="${link}" style="color: #667eea; word-break: break-all;">${link}</a>
            </p>
            
            <p style="font-size: 14px; color: #666;">
                Se non hai richiesto questa registrazione, ignora questa email.
            </p>
        </div>
        
        <div class="footer">
            <p>
                <strong>${realmDisplayName!"Dike"}</strong><br>
                La piattaforma per studi legali
            </p>
            <p style="margin-top: 15px;">
                Per assistenza, contatta il nostro 
                <a href="mailto:supporto@escaligo.it" style="color: #667eea;">team di supporto</a>
            </p>
        </div>
    </div>
</body>
</html>
