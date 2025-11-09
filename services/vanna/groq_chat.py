import os

from groq import Groq as GroqClient

from vanna.base import VannaBase
from vanna.chromadb import ChromaDB_VectorStore


class Groq(VannaBase):
    def __init__(self, client=None, config=None):
        if config is None:
            config = {}
        VannaBase.__init__(self, config=config)

        self.temperature = 0.7

        if "temperature" in config:
            self.temperature = config["temperature"]

        if client is not None:
            self.client = client
            return

        if config is None and client is None:
            self.client = GroqClient(api_key=os.getenv("GROQ_API_KEY"))
            return

        if "api_key" in config:
            self.client = GroqClient(api_key=config["api_key"])

    def system_message(self, message: str) -> any:
        return {"role": "system", "content": message}

    def user_message(self, message: str) -> any:
        return {"role": "user", "content": message}

    def assistant_message(self, message: str) -> any:
        return {"role": "assistant", "content": message}

    def submit_prompt(self, prompt, **kwargs) -> str:
        if prompt is None:
            raise Exception("Prompt is None")

        if len(prompt) == 0:
            raise Exception("Prompt is empty")

        num_tokens = 0
        for message in prompt:
            num_tokens += len(message["content"]) / 4

        model = None
        if kwargs.get("model", None) is not None:
            model = kwargs.get("model", None)
        elif self.config is not None and "model" in self.config:
            model = self.config["model"]
        else:
            model = "llama-3.1-8b-instant"

        print(f"Using model {model} for {num_tokens} tokens (approx)")
        
        response = self.client.chat.completions.create(
            model=model,
            messages=prompt,
            stop=None,
            temperature=self.temperature,
        )

        for choice in response.choices:
            if hasattr(choice, "text") and choice.text:
                return choice.text

        return response.choices[0].message.content


class LocalContext_Groq(ChromaDB_VectorStore, Groq):
    def __init__(self, config=None):
        if config is None:
            config = {}
        ChromaDB_VectorStore.__init__(self, config=config)
        Groq.__init__(self, config=config)
