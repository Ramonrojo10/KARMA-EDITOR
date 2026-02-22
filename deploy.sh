#!/bin/bash
# ============================================================
# KARMA OPS EDITOR — Deploy script
# Ejecutar en el VPS como root o usuario con sudo
# ============================================================

set -e

REPO="https://github.com/Ramonrojo10/KARMA-EDITOR.git"
BRANCH="claude/postgres-database-connection-SuSGF"
APP_DIR="/var/www/karma-ops-editor"
NGINX_SITE="/etc/nginx/sites-available/karma-ops-editor"
DOMAIN="shitoushi.karmaops.online"

echo ""
echo "=================================================="
echo "  KARMA OPS EDITOR — Deploy"
echo "  Dominio: $DOMAIN"
echo "=================================================="
echo ""

# ── 1. Clonar o actualizar repo ─────────────────────────────
if [ -d "$APP_DIR/.git" ]; then
  echo "▶ Actualizando repo..."
  cd "$APP_DIR"
  git fetch origin
  git checkout "$BRANCH"
  git pull origin "$BRANCH"
else
  echo "▶ Clonando repo..."
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 2. Variables de entorno ──────────────────────────────────
if [ ! -f "$APP_DIR/.env" ]; then
  echo "▶ Creando .env desde .env.example..."
  cat > "$APP_DIR/.env" << 'ENVEOF'
NODE_ENV=production
PORT=4000
DATABASE_URL=postgres://postgres:ckTdIVsSlCLZq5HGWDTudzhkweN2sWEuXVgiOgyORL1gEWe57dPK7hhwKbhHl0Hc@127.0.0.1:5432/karma_editor
JWT_SECRET=CHANGE_THIS_TO_A_SECURE_RANDOM_STRING
FRONTEND_URL=https://shitoushi.karmaops.online
N8N_WEBHOOK_URL=https://n8n2.0.karmaops.online/webhook/video-upload
ENVEOF
  echo "  ⚠️  Edita $APP_DIR/.env con tus valores reales antes de continuar"
fi

# ── 3. Instalar dependencias frontend y buildear ─────────────
echo "▶ Instalando dependencias frontend..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps

echo "▶ Buildeando frontend..."
npm run build
echo "✓ Frontend buildeado en frontend/dist"

# ── 4. Instalar dependencias backend ────────────────────────
echo "▶ Instalando dependencias backend..."
cd "$APP_DIR/backend"
npm install --omit=dev

# ── 5. Aplicar schema a postgres ────────────────────────────
echo "▶ Aplicando schema a postgres..."
cd "$APP_DIR"
# Obtener el ID del contenedor postgres automáticamente
POSTGRES_CONTAINER=$(docker ps --format '{{.ID}} {{.Image}}' | grep -i postgres | awk '{print $1}' | head -1)

if [ -n "$POSTGRES_CONTAINER" ]; then
  docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d karma_editor < database/schema.sql 2>/dev/null || \
  docker exec -i "$POSTGRES_CONTAINER" psql -U postgres -d karma_editor < database/crm-schema.sql 2>/dev/null || \
  echo "  ⚠️  Schema ya aplicado o aplícalo manualmente"
  echo "✓ Schema postgres listo"
else
  echo "  ⚠️  Contenedor postgres no encontrado — aplica el schema manualmente:"
  echo "     psql -U postgres -d karma_editor -f $APP_DIR/database/schema.sql"
fi

# ── 6. Arrancar backend con PM2 ──────────────────────────────
echo "▶ Arrancando backend con PM2..."
cd "$APP_DIR"

# Instalar PM2 si no está
if ! command -v pm2 &> /dev/null; then
  echo "  Instalando PM2..."
  npm install -g pm2
fi

pm2 delete karma-ops-editor 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save
echo "✓ Backend arrancado en puerto 4000"

# ── 7. Configurar nginx ──────────────────────────────────────
echo "▶ Configurando nginx..."
cp "$APP_DIR/nginx.conf" "$NGINX_SITE"
ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/karma-ops-editor
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx
echo "✓ Nginx configurado para $DOMAIN"

# ── 8. SSL con certbot ───────────────────────────────────────
echo ""
echo "▶ Configurando SSL con certbot..."
if command -v certbot &> /dev/null; then
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@karmaops.online || \
  echo "  ⚠️  Certbot falló — asegúrate de que el DNS apunta a este servidor"
else
  echo "  Instalando certbot..."
  apt-get install -y certbot python3-certbot-nginx
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@karmaops.online || \
  echo "  ⚠️  Certbot falló — asegúrate de que el DNS apunta a este servidor"
fi

echo ""
echo "=================================================="
echo "  ✅ Deploy completo"
echo "  URL: https://$DOMAIN"
echo ""
echo "  IMPORTANTE — Si el DNS aún no apunta aquí:"
echo "  Añade en Hostinger un registro A:"
echo "    Nombre: shitoushi"
echo "    Valor: $(curl -s ifconfig.me 2>/dev/null || echo 'IP_DEL_VPS')"
echo ""
echo "  PM2 status: pm2 status"
echo "  Logs backend: pm2 logs karma-ops-editor"
echo "  Logs nginx: tail -f /var/log/nginx/error.log"
echo "=================================================="
echo ""
