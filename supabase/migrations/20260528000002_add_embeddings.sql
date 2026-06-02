-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pgmq extension for durable queue
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Add embedding column to profiles (384-dim vector from gte-small model)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS embedding vector(384);

-- Create the embedding_refresh queue for async re-embedding
SELECT pgmq.create('embedding_refresh');
