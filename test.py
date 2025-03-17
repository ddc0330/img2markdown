import google.generativeai as genai
import os

api_key = 'AIzaSyBwtK_eN18NdgCXe2COQVcNCMVr16shQZg'
genai.configure(api_key = api_key)

model = genai.GenerativeModel('gemini-1.5-flash')
response = model.generate_content('你是誰')

print(response.text)