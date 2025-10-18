pip install --upgrade pip setuptools
pip install -r requirements.txt
streamlit run enhanced_universe.py --server.port $PORT --server.address 0.0.0.0 --server.enableCORS false
