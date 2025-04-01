from fastapi import FastAPI
from contextlib import asynccontextmanager
import redis
import uvicorn
from backend.app.api import session, tracking
from backend.app.utils.redis_utils import get_redis_connection

# Define a lifespan context for FastAPI
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = redis.Redis(host='localhost', port=6379, db=0)
    yield
    app.state.redis.close()  # Close connection on shutdown

app = FastAPI(lifespan=lifespan)


# Include your routers
app.include_router(session.router)
app.include_router(tracking.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
