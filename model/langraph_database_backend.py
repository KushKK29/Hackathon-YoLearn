from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph.message import add_messages
import sqlite3
import os

# --- Hugging Face specific imports ---
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

# --- Hugging Face model setup ---
os.environ['HF_HOME'] = 'D:/huggingface_cache'   # cache dir (optional)

device = 0 if torch.cuda.is_available() else -1   # HF pipeline expects int, not str
print(f"Device set to use {'cuda' if device == 0 else 'cpu'}")

# Load the Hugging Face model & tokenizer
model_id = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

# Hugging Face pipeline
pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=200,
    device=device
)

# Wrap in LangChain
llm_pipeline = HuggingFacePipeline(pipeline=pipe)
llm = ChatHuggingFace(llm=llm_pipeline)


# --- LangGraph State Setup ---
class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

def chat_node(state: ChatState):
    """Invokes the chat model with conversation history."""
    messages = state["messages"]
    response = llm.invoke(messages)
    return {"messages": [response]}


# --- SQLite Checkpointer ---
conn = sqlite3.connect(database="chatbot.db", check_same_thread=False)
checkpointer = SqliteSaver(conn=conn)

graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

# Final compiled chatbot
chatbot = graph.compile(checkpointer=checkpointer)
