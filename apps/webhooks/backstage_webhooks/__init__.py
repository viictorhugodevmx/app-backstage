from flask import Flask, jsonify


def create_app(test_config=None):
    app = Flask(__name__)

    if test_config is not None:
        app.config.update(test_config)

    @app.get("/health")
    def health():
        return jsonify(
            status="ok",
            service="backstage-webhooks",
        )

    return app
