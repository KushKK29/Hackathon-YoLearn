from langraph_database_backend import chatbot
from langchain_core.messages import HumanMessage

# Single chat session ID
THREAD_ID = "single-session"

def chat():
    print("Chatbot ready! Type 'exit' to quit.\n")

    while True:
        user_input = input("You: ")
        if user_input.lower() == "exit":
            print("Exiting chat...")
            break

        CONFIG = {"configurable": {"thread_id": THREAD_ID}}

        # Invoke chatbot with persistence
        response = chatbot.invoke(
            {"messages": [HumanMessage(content=user_input)]},
            config=CONFIG
        )

        # Get AI's reply
        ai_message = response["messages"][-1].content
        print("AI:", ai_message)


if __name__ == "__main__":
    chat()
