import redis

def get_redis_connection(app):
    return app.state.redis