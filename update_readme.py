import re

with open("README.md", "r") as f:
    content = f.read()

# Regex to remove the outdated markdown text layout instructions
# We'll replace the Markdown body section with a new explanation
old_section_regex = r'\*\*Text\*\* — headings, paragraphs, and lists default.*?\(same as the rest of the body\)\.'

new_text = '''**Text** — headings (`##`, `###`) are placed in the first column and take 1 column width. Paragraphs, lists, and quotes automatically start in the 2nd column and span 2 columns width. They automatically align on the same row, so you don't need any layout wrappers.'''

content = re.sub(old_section_regex, new_text, content, flags=re.DOTALL)

with open("README.md", "w") as f:
    f.write(content)
