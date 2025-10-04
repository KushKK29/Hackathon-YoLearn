from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph.message import add_messages
from langchain_huggingface import ChatHuggingFace, HuggingFacePipeline
import os
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

# Set the Hugging Face cache directory
os.environ['HF_HOME'] = 'D:/huggingface_cache'

# Set the device to CPU. The original code already did this in the terminal output.
# You can explicitly set it here if you want to be sure.
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Device set to use {device}")

# 1. Define the Hugging Face pipeline first
model_id = 'TinyLlama/TinyLlama-1.1B-Chat-v1.0'
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

pipe = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    max_new_tokens=100,
    device=device  # Ensure the pipeline uses the correct device
)

# 2. Wrap the Hugging Face pipeline in a LangChain HuggingFacePipeline object.
# This makes the pipeline compatible with other LangChain components.
llm_pipeline = HuggingFacePipeline(pipeline=pipe)

# 3. Then, wrap the LangChain pipeline in the ChatHuggingFace class.
# This class handles converting LangChain's BaseMessage objects into the
# chat format expected by the model. The error was here; you were passing `pipeline` directly.
# The `ChatHuggingFace` class expects an LLM-like object, which `HuggingFacePipeline` is.
llm = ChatHuggingFace(llm=llm_pipeline) # Corrected line: pass `llm_pipeline` as the `llm` argument.

class ChatState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

def chat_node(state: ChatState):
    """Invokes the chat model with the current conversation history."""
    messages = state['messages']
    response = llm.invoke(messages)
    
    return {"messages": [response]}

# Checkpointer
checkpointer = InMemorySaver()

graph = StateGraph(ChatState)
graph.add_node("chat_node", chat_node)
graph.add_edge(START, "chat_node")
graph.add_edge("chat_node", END)

chatbot = graph.compile(checkpointer=checkpointer)

# Example usage to verify it works
inputs = {"messages": [HumanMessage(content="Hello, how are you?")]}
for s in chatbot.stream(inputs, config={"configurable": {"thread_id": "1"}}):
    print(s)