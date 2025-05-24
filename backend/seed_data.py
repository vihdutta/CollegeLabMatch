#!/usr/bin/env python3
"""
Sample data script to populate the database with research labs.
Run this after starting the database to have test data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.db import SessionLocal, Lab, init_db
from backend.match import create_embedding

def seed_database():
    """populate database with sample research labs"""
    init_db()
    db = SessionLocal()
    
    # Clear existing data to reseed with updated data
    print("clearing existing lab data...")
    db.query(Lab).delete()
    db.commit()
    
    sample_labs = [
        {
            "name": "Machine Learning Research Lab",
            "university": "Stanford University",
            "pi": "Dr. Sarah Chen",
            "email": "schen@stanford.edu",
            "summary": "Our lab focuses on deep learning, neural networks, and artificial intelligence applications in computer vision and natural language processing. We work on cutting-edge research in transformer architectures, reinforcement learning, and AI safety."
        },
        {
            "name": "Computational Biology Lab",
            "university": "Stanford University", 
            "pi": "Dr. Michael Rodriguez",
            "email": "mrodriguez@stanford.edu",
            "summary": "We develop computational methods for analyzing biological data, including genomics, proteomics, and systems biology. Our research involves bioinformatics algorithms, machine learning for drug discovery, and personalized medicine approaches."
        },
        {
            "name": "Quantum Computing Research Group",
            "university": "MIT",
            "pi": "Dr. Lisa Wang",
            "email": "lwang@mit.edu",
            "summary": "Our group investigates quantum algorithms, quantum error correction, and quantum machine learning. We work on both theoretical foundations and practical implementations of quantum computing systems for solving complex optimization problems."
        },
        {
            "name": "Human-Computer Interaction Lab",
            "university": "MIT",
            "pi": "Dr. James Thompson",
            "email": "jthompson@mit.edu",
            "summary": "We study how people interact with technology and design better user interfaces. Our research includes virtual reality, augmented reality, accessibility technologies, and user experience design for emerging technologies."
        },
        {
            "name": "Robotics and Automation Lab",
            "university": "Carnegie Mellon University",
            "pi": "Dr. Emily Davis",
            "email": "edavis@cmu.edu",
            "summary": "Our lab develops autonomous robots for various applications including manufacturing, healthcare, and exploration. We work on robot perception, motion planning, manipulation, and human-robot collaboration using advanced sensors and AI."
        },
        {
            "name": "Cybersecurity Research Center",
            "university": "Carnegie Mellon University",
            "pi": "Dr. Robert Kim",
            "email": "rkim@cmu.edu",
            "summary": "We research network security, cryptography, and privacy-preserving technologies. Our work includes developing secure communication protocols, analyzing malware, and creating tools for digital forensics and incident response."
        },
        {
            "name": "Data Science and Analytics Lab",
            "university": "UC Berkeley",
            "pi": "Dr. Maria Garcia",
            "email": "mgarcia@berkeley.edu",
            "summary": "Our lab applies statistical methods and machine learning to large-scale data problems. We work on predictive modeling, data visualization, and developing tools for data-driven decision making across various domains including finance and healthcare."
        },
        {
            "name": "Sustainable Energy Systems Lab",
            "university": "UC Berkeley",
            "pi": "Dr. David Lee",
            "email": "dlee@berkeley.edu",
            "summary": "We research renewable energy technologies, smart grid systems, and energy storage solutions. Our work includes solar cell optimization, wind energy modeling, and developing algorithms for efficient energy distribution and consumption."
        },
        # University of Michigan labs
        {
            "name": "Advanced Robotics Laboratory",
            "university": "University of Michigan",
            "pi": "Dr. Chad Jenkins",
            "email": "cjenkins@umich.edu",
            "summary": "Our lab develops intelligent robotic systems with focus on manipulation, perception, and human-robot interaction. We work on autonomous mobile robots, assistive robotics, and machine learning for robotics applications including reinforcement learning and computer vision."
        },
        {
            "name": "Michigan Artificial Intelligence Lab",
            "university": "University of Michigan",
            "pi": "Dr. Satinder Singh Baveja",
            "email": "baveja@umich.edu",
            "summary": "We conduct research in artificial intelligence, machine learning, and reinforcement learning. Our work includes deep learning, neural networks, computational learning theory, and AI applications in autonomous systems and decision making."
        },
        {
            "name": "Computational Medicine and Bioinformatics",
            "university": "University of Michigan",
            "pi": "Dr. Yuanfang Guan",
            "email": "gyuanfan@umich.edu",
            "summary": "Our lab develops computational methods for understanding biological systems and diseases. We work on genomics, systems biology, machine learning for biomedical data, and precision medicine approaches using large-scale biological datasets."
        },
        {
            "name": "Human-Centered Computing Lab",
            "university": "University of Michigan",
            "pi": "Dr. Walter Lasecki",
            "email": "wlasecki@umich.edu",
            "summary": "We research human-computer interaction, crowdsourcing, and collaborative systems. Our work includes accessibility technologies, social computing, and designing interactive systems that combine human intelligence with artificial intelligence."
        },
        {
            "name": "Michigan Quantum Information Science",
            "university": "University of Michigan",
            "pi": "Dr. Johannes Pollanen",
            "email": "pollanen@umich.edu",
            "summary": "Our lab investigates quantum systems and quantum information processing. We work on quantum computing hardware, quantum sensors, and quantum materials with applications in quantum networking and quantum simulation using superconducting and semiconductor platforms."
        },
        {
            "name": "Climate and Space Sciences Laboratory",
            "university": "University of Michigan",
            "pi": "Dr. Tamas Gombosi",
            "email": "tgombosi@umich.edu",
            "summary": "We study space weather, planetary atmospheres, and climate systems using computational modeling and satellite data analysis. Our research includes magnetosphere dynamics, solar wind interactions, and atmospheric physics with applications to space exploration."
        },
        {
            "name": "Materials Informatics Laboratory",
            "university": "University of Michigan",
            "pi": "Dr. Luca Bertoldi",
            "email": "bertoldi@umich.edu",
            "summary": "Our lab applies machine learning and data science to materials engineering and design. We work on computational materials science, high-throughput materials discovery, and developing predictive models for material properties and performance."
        },
        {
            "name": "Transportation Analytics Lab",
            "university": "University of Michigan",
            "pi": "Dr. Yafeng Yin",
            "email": "yafeng@umich.edu",
            "summary": "We research intelligent transportation systems, autonomous vehicles, and traffic optimization. Our work includes machine learning for transportation, connected vehicle technologies, and developing algorithms for smart mobility and urban planning."
        }
    ]
    
    print("creating embeddings and inserting lab data...")
    
    for lab_data in sample_labs:
        # create embedding from lab summary
        embedding = create_embedding(lab_data["summary"])
        
        lab = Lab(
            name=lab_data["name"],
            university=lab_data["university"],
            pi=lab_data["pi"],
            email=lab_data["email"],
            summary=lab_data["summary"],
            embedding=embedding
        )
        
        db.add(lab)
        print(f"added: {lab_data['name']} at {lab_data['university']}")
    
    db.commit()
    db.close()
    
    print(f"successfully seeded database with {len(sample_labs)} labs")

if __name__ == "__main__":
    seed_database() 