from google import genai
from PIL import Image

# Initialize the new client
import os
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def extract_handwriting(image_path):
    print(f"Sending {image_path} to Cloud API...")
    img = Image.open(image_path)
    
    # Use the new SDK syntax
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=[
            "Transcribe the handwritten text from this exam paper precisely. Return only the extracted text.",
            img
        ]
    )
    return response.text

if __name__ == "__main__":
    test_img_path = "test.jpg"
    
    try:
        text = extract_handwriting(test_img_path)
        print("\n--- EXTRACTION SUCCESS ---")
        print(text)
    except Exception as e:
        import traceback
        print("\n--- ERROR ---")
        traceback.print_exc()