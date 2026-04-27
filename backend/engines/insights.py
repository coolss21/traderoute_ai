import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_ai_insights(req_data, route_models, recommendation) -> str:
    """
    Calls Gemini API to generate strategic insights based on the analysis.
    Returns None if the API is not configured or fails.
    """
    if not api_key:
        return None

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Prepare context for the AI
        recommended_route = next((r for r in route_models if r.is_recommended), route_models[0])
        cheapest_route = next((r for r in route_models if r.route_type.value == "cheapest"), None)
        fastest_route = next((r for r in route_models if r.route_type.value == "fastest"), None)
        
        prompt = f"""
        You are a seasoned global supply chain and logistics analyst for TradeRoute AI.
        Based on the following shipment analysis, provide 2-3 concise, strategic insights or action items for the buyer. Keep it under 4 sentences total. Focus on risks, hidden costs, or supply chain resilience. Don't use markdown formatting like bolding or bullet points.

        Shipment: {req_data.quantity} units of HSN {req_data.hsn_code} from {req_data.origin} to {req_data.destination}. Invoice Value: ${req_data.invoice_value}.
        Buyer Priority: {req_data.buyer_priority.value.upper()}. Urgency: {req_data.urgency.value.upper()}.

        Recommended Route: {recommended_route.mode.upper()} via {recommended_route.path[-2]} ({recommended_route.transit_days} days). True Cost: ${recommended_route.true_cost}. Risk Level: {recommended_route.risk_assessment.risk_level}.
        """
        
        if cheapest_route and cheapest_route.route_id != recommended_route.route_id:
            prompt += f"The cheapest route was {cheapest_route.mode.upper()} (${cheapest_route.true_cost}) but had a risk level of {cheapest_route.risk_assessment.risk_level}. "
            if cheapest_route.is_cost_illusion:
                prompt += "It was flagged as a 'Cost Illusion' due to high hidden risk costs. "
        
        if recommended_route.risk_assessment.active_disruption:
            prompt += f"\nACTIVE DISRUPTION DETECTED: {recommended_route.risk_assessment.active_disruption}. Nodes affected: {recommended_route.risk_assessment.disrupted_nodes}."

        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return None
