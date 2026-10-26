import React, { useRef } from 'react';

// Unit convention: 1 scene unit ≈ 10 cm
const LEG_RADIUS = 0.18;
const LEG_SEGMENTS = 32;
const woodMaterial = { roughness: 0.55, metalness: 0.05 };

// ── 1. โต๊ะไม้ (Dining / Work Table) ──────────────────────────
const TableModel = ({ width, depth, height, color }) => {
  const topThickness = 0.35;
  const legHeight = height;
  const offsetW = width / 2 - LEG_RADIUS * 2.5;
  const offsetD = depth / 2 - LEG_RADIUS * 2.5;
  const legPositions = [
    [-offsetW,  offsetD],
    [ offsetW,  offsetD],
    [-offsetW, -offsetD],
    [ offsetW, -offsetD],
  ];

  return (
    <group>
      {/* ท็อปโต๊ะไม้ */}
      <mesh position={[0, legHeight + topThickness / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, topThickness, depth]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>

      {/* ขาโต๊ะไม้ 4 ขา */}
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, legHeight / 2, z]} castShadow receiveShadow>
          <cylinderGeometry args={[LEG_RADIUS, LEG_RADIUS * 1.1, legHeight, LEG_SEGMENTS]} />
          <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
        </mesh>
      ))}

      {/* คานยึดโครงไม้ */}
      <mesh position={[0, legHeight * 0.35, 0]} castShadow>
        <boxGeometry args={[Math.max(0.2, width - LEG_RADIUS * 6), 0.12, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
      </mesh>
      <mesh position={[0, legHeight * 0.35, 0]} castShadow>
        <boxGeometry args={[0.12, 0.12, Math.max(0.2, depth - LEG_RADIUS * 6)]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
      </mesh>
    </group>
  );
};

// ── 2. เก้าอี้ไม้ล้วน (Solid Wood Chair) ───────────────────────
const ChairModel = ({ width, depth, height, color }) => {
  const seatH = height * 0.55;
  const backH = height * 0.7;
  const seatT = 0.3;
  const offsetW = width / 2 - LEG_RADIUS * 2;
  const offsetD = depth / 2 - LEG_RADIUS * 2;
  const legPositions = [
    [-offsetW,  offsetD],
    [ offsetW,  offsetD],
    [-offsetW, -offsetD],
    [ offsetW, -offsetD],
  ];

  return (
    <group>
      {/* ที่นั่งไม้ */}
      <mesh position={[0, seatH + seatT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, seatT, depth]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>

      {/* ขาเก้าอี้ไม้ 4 ขา */}
      {legPositions.map(([x, z], i) => (
        <mesh key={i} position={[x, seatH / 2, z]} castShadow receiveShadow>
          <cylinderGeometry args={[LEG_RADIUS * 0.9, LEG_RADIUS, seatH, LEG_SEGMENTS]} />
          <meshStandardMaterial color={color} roughness={0.65} metalness={0.05} />
        </mesh>
      ))}

      {/* เสาพนักพิงไม้ */}
      <mesh position={[-offsetW, seatH + backH / 2, -offsetD]} castShadow>
        <cylinderGeometry args={[LEG_RADIUS * 0.8, LEG_RADIUS * 0.8, backH, LEG_SEGMENTS]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>
      <mesh position={[offsetW, seatH + backH / 2, -offsetD]} castShadow>
        <cylinderGeometry args={[LEG_RADIUS * 0.8, LEG_RADIUS * 0.8, backH, LEG_SEGMENTS]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>

      {/* พนักพิงหลังไม้ระแนง */}
      <mesh position={[0, seatH + backH * 0.8, -offsetD]} castShadow>
        <boxGeometry args={[width, backH * 0.35, 0.2]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>
    </group>
  );
};

// ── 3. ตู้วางถ้วยชาม / ตู้เก็บของไม้ (Solid Wood Cupboard / Sideboard) ─
const CupboardModel = ({ width, depth, height, color }) => {
  const panelT = 0.22;
  const legH = Math.min(1.2, height * 0.15);
  const bodyH = height - legH;
  const bodyY = legH + bodyH / 2;
  const legR = 0.15;
  const offsetW = width / 2 - 0.4;
  const offsetD = depth / 2 - 0.4;

  return (
    <group>
      {/* ตัวตู้ไม้ (กล่องตู้) */}
      <mesh position={[0, bodyY, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, bodyH, depth]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>

      {/* หน้าบานตู้ไม้คู่ (Door panels พร้อมร่องแบ่งกลาง) */}
      <mesh position={[-width * 0.25, bodyY, depth / 2 + 0.05]} castShadow>
        <boxGeometry args={[width * 0.48, bodyH * 0.92, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[width * 0.25, bodyY, depth / 2 + 0.05]} castShadow>
        <boxGeometry args={[width * 0.48, bodyH * 0.92, 0.12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>

      {/* มือจับไม้ (Wooden Handles) */}
      <mesh position={[-0.3, bodyY, depth / 2 + 0.16]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.3} />
      </mesh>
      <mesh position={[0.3, bodyY, depth / 2 + 0.16]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.3} />
      </mesh>

      {/* ขาตู้ยกสูง 4 ขา */}
      {[[-offsetW, offsetD], [offsetW, offsetD], [-offsetW, -offsetD], [offsetW, -offsetD]].map(([x, z], i) => (
        <mesh key={i} position={[x, legH / 2, z]} castShadow>
          <cylinderGeometry args={[legR * 0.9, legR, legH, 16]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
};

// ── 4. ชั้นวางรองเท้า / ชั้นวางไม้ระแนง (Slatted Shoe Rack / Shelf) ─
const ShoeRackModel = ({ width, depth, height, color }) => {
  const postThickness = 0.24;
  const tierCount = 3;
  const tierYPositions = Array.from({ length: tierCount }, (_, i) => 0.5 + (height - 0.8) * (i / (tierCount - 1)));
  const slatCount = 5;

  return (
    <group>
      {/* เสาโครงไม้ 4 ด้าน */}
      <mesh position={[-width / 2 + postThickness / 2, height / 2, -depth / 2 + postThickness / 2]} castShadow>
        <boxGeometry args={[postThickness, height, postThickness]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>
      <mesh position={[width / 2 - postThickness / 2, height / 2, -depth / 2 + postThickness / 2]} castShadow>
        <boxGeometry args={[postThickness, height, postThickness]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>
      <mesh position={[-width / 2 + postThickness / 2, height / 2, depth / 2 - postThickness / 2]} castShadow>
        <boxGeometry args={[postThickness, height, postThickness]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>
      <mesh position={[width / 2 - postThickness / 2, height / 2, depth / 2 - postThickness / 2]} castShadow>
        <boxGeometry args={[postThickness, height, postThickness]} />
        <meshStandardMaterial color={color} {...woodMaterial} />
      </mesh>

      {/* ชั้นวางระแนงไม้โปร่งสำหรับระบายอากาศ */}
      {tierYPositions.map((y, tIdx) => (
        <group key={tIdx} position={[0, y, 0]}>
          {/* ขอบคานข้าง */}
          <mesh position={[0, 0, -depth / 2 + 0.15]} castShadow>
            <boxGeometry args={[width, 0.18, 0.15]} />
            <meshStandardMaterial color={color} {...woodMaterial} />
          </mesh>
          <mesh position={[0, 0, depth / 2 - 0.15]} castShadow>
            <boxGeometry args={[width, 0.18, 0.15]} />
            <meshStandardMaterial color={color} {...woodMaterial} />
          </mesh>

          {/* ซี่ระแนงไม้ */}
          {Array.from({ length: slatCount }, (_, sIdx) => {
            const zPos = -depth / 2 + 0.35 + (depth - 0.7) * (sIdx / (slatCount - 1));
            return (
              <mesh key={sIdx} position={[0, 0.05, zPos]} castShadow>
                <boxGeometry args={[width - 0.4, 0.12, 0.18]} />
                <meshStandardMaterial color={color} {...woodMaterial} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
};

// ── Main Model Switcher ────────────────────────────────────────
const FurnitureModel = ({ width, depth, height, color = '#d4b595', furnitureType = 'table' }) => {
  const group = useRef();

  return (
    <group ref={group} dispose={null}>
      {furnitureType === 'chair'    && <ChairModel width={width} depth={depth} height={height} color={color} />}
      {furnitureType === 'cupboard' && <CupboardModel width={width} depth={depth} height={height} color={color} />}
      {furnitureType === 'shoerack' && <ShoeRackModel width={width} depth={depth} height={height} color={color} />}
      {(furnitureType === 'table' || !['chair', 'cupboard', 'shoerack'].includes(furnitureType)) && (
        <TableModel width={width} depth={depth} height={height} color={color} />
      )}
    </group>
  );
};

export default React.memo(FurnitureModel);
