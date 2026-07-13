"""WSGI entrypoint for Render (and any other WSGI host).

Render looks for common entrypoint files such as ``wsgi.py``, ``app.py``, or
``application.py`` when auto-detecting a Flask application.  This thin shim
re-exports the ``app`` object from ``api.py`` so the auto-detector succeeds
without requiring any changes to the main application module.

The ``render.yaml`` start command still uses ``gunicorn api:app`` directly,
so this file is only needed to satisfy Render's entrypoint scanner.
"""

from api import app  # noqa: F401  (re-export for WSGI servers)

__all__ = ["app"]
