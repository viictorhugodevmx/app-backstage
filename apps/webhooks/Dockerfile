FROM python:3.12-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.lock ./
RUN python -m pip install --no-cache-dir -r requirements.lock

COPY --chown=1000:1000 backstage_webhooks ./backstage_webhooks
COPY --chown=1000:1000 tests ./tests
COPY --chown=1000:1000 pyproject.toml ./

USER 1000:1000

EXPOSE 3002

CMD ["python", "-m", "flask", "--app", "backstage_webhooks:create_app", "run", "--host", "0.0.0.0", "--port", "3002"]
