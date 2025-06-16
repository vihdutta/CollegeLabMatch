import requests
import asyncio
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime
import logging
from urllib.parse import urljoin
from dotenv import load_dotenv
from crawl4ai import AsyncWebCrawler
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def scrape_labs_to_json():
    try:
        logger.info("Starting enhanced lab scraping with crawl4ai...")

        base_url = "https://robotics.umich.edu"

        faculty_page_url = urljoin(base_url, "/people/faculty/")
        response = requests.get(faculty_page_url)
        soup = BeautifulSoup(response.text, 'html.parser')

        faculty_container = soup.select_one("body > main > div.mx-2.m-auto.mb-4.md\\:mx-12 > div > div")
        if not faculty_container:
            logger.error("Could not find faculty container. The site structure may have changed.")
            return False
        
        faculty_links = faculty_container.find_all('a')
        logger.info(f"Found {len(faculty_links)} faculty members")


        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            return False

        genai.configure(api_key=gemini_api_key)
        gemini_client = genai.GenerativeModel('gemini-2.0-flash')

        async with AsyncWebCrawler(verbose=True) as crawler:
            labs_data = []

            for link in faculty_links:
                href = link.get('href')
                if not href:
                    continue

                full_faculty_url = urljoin(base_url, href)
                logger.debug(f"Processing faculty member: {full_faculty_url}")
                
                try:
                    lab_data = await process_faculty_page_enhanced(full_faculty_url, base_url, crawler, gemini_client)
                    if lab_data:
                        lab_data["id"] = f"lab_{len(labs_data) + 1}"
                        labs_data.append(lab_data)
                        logger.info(f"Saved lab: {lab_data.get('name', 'Unknown')}")
                        
                except Exception as e:
                    logger.error(f"Error processing {full_faculty_url}: {str(e)}")
                    continue
        
            # Save to JSON file
            os.makedirs("data", exist_ok=True)
            output_filename = "data/labs_data.json"
            
            with open(output_filename, 'w', encoding='utf-8') as f:
                json.dump(labs_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Successfully saved {len(labs_data)} labs to {output_filename}")
            return True
        
    except Exception as e:
        logger.error(f"Failed to scrape labs: {e}")
        return False


async def process_faculty_page_enhanced(faculty_url, base_url, crawler, gemini_client):
    try:
        faculty_response = requests.get(faculty_url)
        faculty_soup = BeautifulSoup(faculty_response.text, 'html.parser')

        # Extract professor name from faculty page
        professor_name = extract_professor_name(faculty_soup)
        logger.debug(f"Extracted professor name: {professor_name}")

        lab_site = faculty_soup.select_one("body > main > main > div.grid.md\\:grid-cols-3.gap-8 > div.md\\:col-span-2 > div:nth-child(4) > p:nth-child(2) > a")
        if not lab_site:
            return None
        
        lab_site_link = lab_site.get('href')
        if not lab_site_link:
            return None

        full_lab_url = urljoin(faculty_url, lab_site_link)
        logger.debug(f"Found lab site: {full_lab_url}")

        try:
            result = await crawler.arun(url=full_lab_url)
            if result.success:
                page_text = result.markdown
                
                # Get lab name from title
                soup = BeautifulSoup(result.html, 'html.parser')
                lab_name = soup.title.string if soup.title else "Unknown Lab"
                
                # Generate AI description
                ai_description = await generate_lab_description(page_text, lab_name, gemini_client)
                
                lab_data = {
                    "name": lab_name.strip(),
                    "professor": professor_name,
                    "url": full_lab_url,
                    "content": page_text[:10000],  # Limit content length
                    "description": ai_description or lab_name.strip(),
                    "research_areas": extract_research_areas(page_text),
                    "scraped_at": datetime.now().isoformat()
                }
                
                return lab_data
            else:
                logger.warning(f"Crawl4ai failed for {full_lab_url}: {result.error_message}")
                return None
                
        except Exception as e:
            logger.error(f"Error using crawl4ai for {full_lab_url}: {e}")
            return None
        
    except Exception as e:
        logger.error(f"Error processing faculty page {faculty_url}: {str(e)}")
        return None


async def generate_lab_description(page_content, lab_name, gemini_client):
    try:
        content_sample = page_content[:10000] if len(page_content) > 10000 else page_content
        
        prompt = f"""
        Based on the following content from the website of "{lab_name}", 
        provide a clear, informative, and concise description (5 sentences) 
        of what this robotics research lab does with all keywords related 
        to the lab and field for researchers and the lab's main research focus areas. 
        If there already exists a description on the website, use that.
        Do not bold or italicize any text:
        
        Content: {content_sample}
        
        Description:"""
        
        response = gemini_client.generate_content(prompt)
        
        if response.text:
            description = response.text.strip()
            logger.info(f"Generated AI description for {lab_name}")
            return description
        else:
            logger.warning(f"Empty response from Gemini for {lab_name}")
            return None
        
    except Exception as e:
        logger.error(f"Error generating AI description for {lab_name}: {e}")
        return None


def extract_professor_name(faculty_soup):
    """
    Extract professor name from faculty page
    """
    try:
        # Try to find the professor name from the faculty page heading
        name_element = faculty_soup.select_one("body > main > main > div.grid.md\\:grid-cols-3.gap-8 > div.md\\:col-span-2 > div:nth-child(1) > h1")
        if name_element:
            return name_element.get_text(strip=True)
        
        # Fallback: try other possible selectors
        name_selectors = [
            "h1",
            ".faculty-name",
            "[data-name]",
            "main h1"
        ]
        
        for selector in name_selectors:
            element = faculty_soup.select_one(selector)
            if element:
                name = element.get_text(strip=True)
                if name and len(name) > 2:  # Basic validation
                    return name
        
        return "Unknown Professor"
        
    except Exception as e:
        logger.error(f"Error extracting professor name: {e}")
        return "Unknown Professor"


def extract_research_areas(page_content):
    """
    Extract research areas from page content using keyword matching
    """
    try:
        content_lower = page_content.lower()
        
        # Common robotics research areas
        research_keywords = [
            "autonomous systems", "computer vision", "machine learning", "artificial intelligence",
            "human-robot interaction", "control systems", "perception", "manipulation",
            "mobile robotics", "autonomous vehicles", "drones", "medical robotics",
            "surgical robotics", "humanoid robots", "robot learning", "SLAM",
            "path planning", "motion planning", "sensor fusion", "localization",
            "robot perception", "robotic manipulation", "swarm robotics", "bio-inspired robotics"
        ]
        
        found_areas = []
        for keyword in research_keywords:
            if keyword in content_lower:
                found_areas.append(keyword.title())
        
        return found_areas[:5]  # Return as list, limit to top 5 areas
        
    except Exception as e:
        logger.error(f"Error extracting research areas: {e}")
        return []


async def update_pinecone_from_json():
    """
    Cron-friendly function to update Pinecone DB from JSON data
    """
    try:
        # Import required libraries directly to avoid models dependency
        from pinecone import Pinecone
        import numpy as np
        
        logger.info("Starting Pinecone update...")
        
        # Initialize Pinecone directly
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            logger.error("PINECONE_API_KEY not found in environment variables")
            return False
        
        pc = Pinecone(api_key=api_key)
        index = pc.Index("collegelabmatch")
        
        # Initialize vector service
        try:
            from .vector_service import VectorService
        except ImportError:
            from vector_service import VectorService
        
        vector_service = VectorService()
        
        # Load JSON data
        json_file = "data/labs_data.json"
        if not os.path.exists(json_file):
            logger.error(f"JSON file not found: {json_file}")
            return False
        
        with open(json_file, 'r', encoding='utf-8') as f:
            labs_data = json.load(f)
        
        logger.info(f"Loaded {len(labs_data)} labs from JSON")
        
        # Process each lab
        success_count = 0
        for lab in labs_data:
            try:
                # Use AI-generated description for vectorization instead of raw content
                ai_description = lab.get('description', '')
                if not ai_description or ai_description == lab.get('name', ''):
                    # Fallback to name + limited content if no AI description available
                    description = f"{lab.get('name', '')} {lab.get('content', '')[:500]}"
                else:
                    # Use the AI-generated description for vectorization
                    description = f"{lab.get('name', '')} {ai_description}"
                
                # Vectorize lab description
                lab_vector = vector_service.vectorize_text(description)
                
                # Prepare metadata for Pinecone
                metadata = {
                    "id": lab.get("id", f"lab_{success_count}"),
                    "name": lab.get("name", ""),
                    "professor": lab.get("professor", ""),
                    "description": lab.get("description", ""),
                    "research_areas": lab.get("research_areas", ""),
                    "website": lab.get("url", ""),
                    "email": lab.get("email", ""),
                    "updated_at": datetime.now().isoformat()
                }
                
                # Upsert to Pinecone directly
                vector_list = lab_vector.tolist()
                index.upsert(
                    vectors=[(lab.get("id", f"lab_{success_count}"), vector_list, metadata)]
                )
                
                success_count += 1
                logger.info(f"Updated lab in Pinecone: {lab.get('name')}")
            
            except Exception as e:
                logger.error(f"Error processing lab {lab.get('name', 'unknown')}: {e}")
                continue
        
        logger.info(f"Successfully updated {success_count}/{len(labs_data)} labs in Pinecone")
        return success_count > 0
        
    except Exception as e:
        logger.error(f"Failed to update Pinecone: {e}")
        return False


async def main():
    """Main async function to run the full pipeline"""
    print("=== Starting Enhanced Lab Scraping with AI Descriptions ===")
    
    # Step 1: Scrape labs to JSON
    print("Step 1: Scraping labs with crawl4ai and AI descriptions...")
    scraping_success = await scrape_labs_to_json()
    
    if scraping_success:
        print("Lab scraping completed successfully")
        
        # Step 2: Update Pinecone with the scraped data
        print("Step 2: Updating Pinecone database...")
        pinecone_success = await update_pinecone_from_json()
        
        if pinecone_success:
            print("Pinecone update completed successfully")
            print("Full pipeline completed successfully!")
        else:
            print("Pinecone update failed")
    else:
        print("Lab scraping failed - skipping Pinecone update")


if __name__ == "__main__":
    asyncio.run(main())
