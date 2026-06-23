from dotenv import load_dotenv
import streamlit as st
import os
from google import genai
from google.genai import types

load_dotenv()

st.set_page_config(page_title="Debt Document Analyzer", page_icon="💰", layout="centered")

# Initialize Gemini client once per session
if "client" not in st.session_state:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        st.error("Missing GEMINI_API_KEY in environment.")
        st.stop()
    st.session_state.client = genai.Client(api_key=api_key)

st.title("💰 Debt Document Analyzer")
st.caption(
    "Upload a bank statement, CIBIL report, or loan document. "
    "Gemini extracts the key numbers, then you can ask follow-up questions."
)

# -- 1. File upload ----------------------------------------------------------
uploaded_file = st.file_uploader("Upload financial document (PDF)", type="pdf")

if uploaded_file and "financial_data" not in st.session_state:
    with st.spinner("Analyzing your document…"):
        pdf_bytes = uploaded_file.read()

        extraction_prompt = """
You are a financial analyst specializing in personal debt management in India.
Analyze this document and extract the following, using INR for all amounts:

1. **Document type** — bank statement / CIBIL report / loan agreement / other
2. **Key numbers**:
   - Total outstanding debt
   - Credit score (if present)
   - Monthly income or average balance
   - Total EMI obligations per month
3. **Debt breakdown** — for each loan or credit card:
   - Name / type
   - Outstanding balance
   - Interest rate (APR) if stated
   - Monthly EMI or minimum payment
4. **Red flags** — high-APR debts (>30% APR), default or written-off accounts,
   minimum-payment traps where >80% of the minimum goes to interest
5. **Four to Five -sentence assessment** — be direct and honest about the financial health
   shown in this document.

If any field is missing, write "Not Found". Format clearly with the headings above.
"""
        try:
            response = st.session_state.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                    extraction_prompt,
                ],
            )
            st.session_state.financial_data = response.text
            st.session_state.doc_name = uploaded_file.name
        except Exception as e:
            st.error(f"API error: {e}")

# -- 2. Results and chat -----------------------------------------------------
if "financial_data" in st.session_state:
    st.success(f"✓ Analyzed: {st.session_state.get('doc_name', 'document')}")

    with st.expander("📊 Extracted financial data", expanded=True):
        st.markdown(st.session_state.financial_data)

    st.divider()
    st.subheader("Ask about your finances")

    # Suggested questions as quick-launch buttons
    SUGGESTIONS = [
        "What should I pay off first?",
        "Am I in a debt trap?",
        "How much extra should I pay monthly?",
        "Explain avalanche vs snowball for my situation",
    ]
    cols = st.columns(2)
    for i, s in enumerate(SUGGESTIONS):
        if cols[i % 2].button(s, key=f"s{i}"):
            st.session_state.pending_query = s

    if "messages" not in st.session_state:
        st.session_state.messages = []

    for msg in st.session_state.messages:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])

    # Accept either a typed query or a button click
    active_query = st.chat_input("Ask anything about your finances…") or \
                   st.session_state.pop("pending_query", None)

    if active_query:
        st.session_state.messages.append({"role": "user", "content": active_query})
        with st.chat_message("user"):
            st.markdown(active_query)

        chat_prompt = f"""You are a personal debt management advisor in India.

Based on this financial data extracted from the user's document:
{st.session_state.financial_data}

Answer this question: {active_query}

Be specific. Reference the actual numbers from their document.
Use INR for all currency amounts."""

        with st.chat_message("assistant"):
            with st.spinner("Thinking…"):
                try:
                    res = st.session_state.client.models.generate_content(
                        model="gemini-2.5-flash",
                        contents=chat_prompt,
                    )
                    answer = res.text
                    st.markdown(answer)
                    st.session_state.messages.append({"role": "assistant", "content": answer})
                except Exception as e:
                    st.error(f"Error: {e}")

    # -- 3. Reset controls ---------------------------------------------------
    col1, col2 = st.columns(2)
    if col1.button("🗑️ Clear conversation") and st.session_state.messages:
        st.session_state.messages = []
        st.rerun()
    if col2.button("📄 Analyze a different document"):
        for k in ["financial_data", "messages", "doc_name"]:
            st.session_state.pop(k, None)
        st.rerun()
