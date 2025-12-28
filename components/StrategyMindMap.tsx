
'use client';

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Network, Zap, Target, Shield, Layout, BookOpen, Maximize2, Cpu } from 'lucide-react';
import * as THREE from 'three';
import SpriteText from 'three-spritetext';

// Dynamic import for the 3D graph to prevent SSR issues with Three.js
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), { 
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-[#020202]">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Initializing 3D Neural Matrix...</p>
            </div>
        </div>
    )
});

interface Block {
    id: string;
    type: string;
    content: string;
}

export default function StrategyMindMap({ blocks }: { blocks: Block[] }) {
    const fgRef = useRef<any>(null);

    const graphData = useMemo(() => {
        const nodes: any[] = [];
        const links: any[] = [];

        // 1. Find Root (H1)
        const titleBlock = blocks.find(b => b.type === 'h1') || { id: 'root', content: 'Institutional Architecture' };
        nodes.push({
            id: titleBlock.id,
            name: titleBlock.content,
            val: 60,
            color: '#0ea5e9',
            type: 'root'
        });

        // 2. Identify H2s as Pillars
        const h2s = blocks.filter(b => b.type === 'h2');
        h2s.forEach(h2 => {
            nodes.push({
                id: h2.id,
                name: h2.content,
                val: 30,
                color: '#ffffff',
                type: 'pillar'
            });

            links.push({
                source: titleBlock.id,
                target: h2.id,
                value: 4
            });

            // 3. Sub-nodes (Details)
            const startIdx = blocks.indexOf(h2) + 1;
            let currentIdx = startIdx;
            const children: Block[] = [];
            while (currentIdx < blocks.length && !['h1', 'h2'].includes(blocks[currentIdx].type)) {
                if (blocks[currentIdx].content.trim()) {
                    children.push(blocks[currentIdx]);
                }
                currentIdx++;
            }

            children.slice(0, 5).forEach(child => {
                nodes.push({
                    id: child.id,
                    name: child.content.length > 25 ? child.content.substring(0, 25) + "..." : child.content,
                    val: 12,
                    color: '#ffffff',
                    type: 'detail'
                });

                links.push({
                    source: h2.id,
                    target: child.id,
                    value: 2
                });
            });
        });

        console.log('Graph Data:', { nodes, links, blocksCount: blocks.length });
        return { nodes, links };
    }, [blocks]);

    // Focus Logic
    const handleNodeClick = useCallback((node: any) => {
        if (!fgRef.current) return;
        const distance = 300;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
            node,
            2000
        );
    }, []);

    return (
        <div className="w-full h-[85vh] bg-[#020202] rounded-[4rem] border border-white/5 relative overflow-hidden group/canvas shadow-[inset_0_0_120px_rgba(0,0,0,1)] flex items-center justify-center">
            
            {/* High-Fi HUD Overlays */}
            <div className="absolute top-12 left-12 z-[100] pointer-events-none">
                <div className="flex items-center gap-6 mb-4">
                    <div className="p-4 bg-sky-500 rounded-[1.5rem] shadow-[0_0_50px_rgba(14,165,233,0.5)] rotate-3">
                        <Cpu size={28} className="text-black" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Neural Canvas v.01</h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase tracking-[0.5em] text-sky-500">Live Synthesis Engine</span>
                            <div className="h-[1px] w-12 bg-sky-500/20" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-12 left-12 z-[100] p-6 bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2rem] pointer-events-none opacity-0 group-hover/canvas:opacity-100 transition-all duration-700 translate-y-4 group-hover/canvas:translate-y-0">
                <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Map Density</span>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 w-[65%]" />
                        </div>
                    </div>
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex items-center gap-3">
                        <Maximize2 size={16} className="text-sky-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Fully Navigable 3D Space</span>
                    </div>
                </div>
            </div>

            {/* The 3D Neural matrix */}
            <ForceGraph3D
                ref={fgRef}
                graphData={graphData}
                width={1600}
                height={850}
                backgroundColor="#020202"
                showNavInfo={false}
                
                // Link Aesthetics
                linkColor={() => 'rgba(14, 165, 233, 0.2)'}
                linkWidth={1.5}
                linkDirectionalParticles={4}
                linkDirectionalParticleSpeed={0.006}
                linkDirectionalParticleWidth={4}
                linkDirectionalParticleColor={() => '#0ea5e9'}
                
                // Node Interactivity
                onNodeClick={handleNodeClick}
                
                // Custom 3D Object Rendering
                nodeThreeObject={(node: any) => {
                    const obj = new THREE.Group();

                    // 1. The Core Sphere
                    const size = node.type === 'root' ? 20 : node.type === 'pillar' ? 10 : 6;
                    const sphere = new THREE.Mesh(
                        new THREE.SphereGeometry(size, 32, 32),
                        new THREE.MeshPhongMaterial({
                            color: node.color,
                            transparent: true,
                            opacity: node.type === 'root' ? 1 : 0.7,
                            emissive: node.color,
                            emissiveIntensity: node.type === 'root' ? 1.2 : 0.4
                        })
                    );
                    obj.add(sphere);

                    // 2. Persistent Label (Billboard)
                    if (node.type !== 'detail' || Math.random() > 0.5) {
                        const sprite = new SpriteText(node.name);
                        sprite.color = node.type === 'root' ? '#ffffff' : node.type === 'pillar' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)';
                        sprite.textHeight = node.type === 'root' ? 14 : node.type === 'pillar' ? 8 : 5;
                        sprite.fontFace = 'Inter, sans-serif';
                        sprite.fontWeight = '900';
                        sprite.padding = 2;
                        sprite.position.y = size + 10;
                        obj.add(sprite);
                    }

                    // 3. Galactic Orbit for Root
                    if (node.type === 'root') {
                        const ring = new THREE.Mesh(
                            new THREE.TorusGeometry(32, 0.3, 16, 100),
                            new THREE.MeshBasicMaterial({ color: '#0ea5e9', transparent: true, opacity: 0.3 })
                        );
                        ring.rotation.x = Math.PI / 2;
                        obj.add(ring);
                    }

                    return obj;
                }}
            />

            {/* Empty State */}
            {blocks.length < 3 && (
                <div className="absolute inset-0 z-[150] bg-[#020202]/95 backdrop-blur-3xl flex flex-col items-center justify-center gap-10">
                    <div className="relative">
                        <div className="absolute inset-0 bg-sky-500 blur-3xl opacity-20 animate-pulse" />
                        <div className="p-10 bg-white/[0.03] border border-white/10 rounded-[4rem] relative">
                            <BookOpen size={64} className="text-sky-500/40" strokeWidth={1} />
                        </div>
                    </div>
                    <div className="text-center space-y-4">
                        <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Neuralis Offline</h3>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.5em] max-w-sm leading-relaxed">Initialize your institutional architecture to prime the synthesis matrix</p>
                    </div>
                </div>
            )}
        </div>
    );
}
