#!/usr/bin/env bash
# Crea las 4 tablas DynamoDB en local (:8000)
set -euo pipefail

ENDPOINT="${DYNAMODB_ENDPOINT:-http://127.0.0.1:8000}"
REGION="${AWS_REGION:-us-east-1}"
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-local}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-local}"
export AWS_PAGER=""

echo "Creando tablas en $ENDPOINT ..."

create_or_skip() {
  local name=$1
  shift
  if aws dynamodb create-table \
    --endpoint-url "$ENDPOINT" --region "$REGION" \
    --output text --no-cli-pager \
    "$@" \
    --table-name "$name" \
    --billing-mode PAY_PER_REQUEST \
    >/dev/null 2>&1; then
    echo "  ✓ $name creada"
  else
    if aws dynamodb describe-table \
      --endpoint-url "$ENDPOINT" --region "$REGION" \
      --table-name "$name" --output text --no-cli-pager \
      >/dev/null 2>&1; then
      echo "  ⊘ $name ya existe"
    else
      echo "  ✗ Error al crear $name" >&2
      exit 1
    fi
  fi
}

create_or_skip pos-usuarios \
  --attribute-definitions AttributeName=username,AttributeType=S \
  --key-schema AttributeName=username,KeyType=HASH

create_or_skip pos-productos \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=codigo,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    'IndexName=codigo-index,KeySchema=[{AttributeName=codigo,KeyType=HASH}],Projection={ProjectionType=ALL}'

create_or_skip pos-ventas \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=numero_venta,AttributeType=S \
    AttributeName=fecha,AttributeType=S \
    AttributeName=created_at,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    'IndexName=numero-venta-index,KeySchema=[{AttributeName=numero_venta,KeyType=HASH}],Projection={ProjectionType=ALL}' \
    'IndexName=fecha-index,KeySchema=[{AttributeName=fecha,KeyType=HASH},{AttributeName=created_at,KeyType=RANGE}],Projection={ProjectionType=ALL}'

create_or_skip pos-configuracion \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH

echo "Listo."
