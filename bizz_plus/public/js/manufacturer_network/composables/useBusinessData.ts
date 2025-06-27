import { ref, computed } from 'vue';
import type { BusinessData, EntityType } from '../types/business';

// Sample data with many-to-many relationships
const initialData: BusinessData = {
  zones: [
    { id: 'z1', name: 'WEST', distributorIds: ['d1', 'd2', 'd3'] },
    { id: 'z2', name: 'EAST', distributorIds: ['d4'] },
    { id: 'z3', name: 'NORTH', distributorIds: [] },
  ],
  distributors: [
    { id: 'd1', name: 'Qunova Technologies Private Limited', zoneIds: ['z1'], areaIds: ['a1', 'a2'] },
    { id: 'd2', name: 'Mahavir Marketing', zoneIds: ['z1'], areaIds: ['a2', 'a3'] },
    { id: 'd3', name: 'Sakshi Agencies', zoneIds: ['z1'], areaIds: ['a1'] },
    { id: 'd4', name: 'Karnataka Distributors', zoneIds: ['z2'], areaIds: ['a4'] },
  ],
  areas: [
    { id: 'a1', name: 'Maharashtra', distributorIds: ['d1', 'd3'], outletIds: ['o1', 'o2'] },
    { id: 'a2', name: 'Mumbai', distributorIds: ['d1', 'd2'], outletIds: ['o2', 'o3'] },
    { id: 'a3', name: 'Gujarat', distributorIds: ['d2'], outletIds: ['o4'] },
    { id: 'a4', name: 'Karnataka', distributorIds: ['d4'], outletIds: ['o5'] },
  ],
  outlets: [
    { id: 'o1', name: 'Pune Central', areaIds: ['a1'] },
    { id: 'o2', name: 'Mumbai Downtown', areaIds: ['a1', 'a2'] },
    { id: 'o3', name: 'Andheri West', areaIds: ['a2'] },
    { id: 'o4', name: 'Ahmedabad Main', areaIds: ['a3'] },
    { id: 'o5', name: 'Bangalore Tech Park', areaIds: ['a4'] },
  ],
};

export function useBusinessData() {
  const data = ref<BusinessData>(JSON.parse(JSON.stringify(initialData)));
  const expandedNodes = ref<Set<string>>(new Set(['z1', 'z2']));

  const toggleNode = (nodeId: string) => {
    if (expandedNodes.value.has(nodeId)) {
      expandedNodes.value.delete(nodeId);
    } else {
      expandedNodes.value.add(nodeId);
    }
  };

  const isExpanded = (nodeId: string) => expandedNodes.value.has(nodeId);

  const addEntity = (type: EntityType, name: string, parentId?: string) => {
    const id = `${type[0]}${Date.now()}`;
    
    switch (type) {
      case 'zone':
        data.value.zones.push({ id, name, distributorIds: [] });
        break;
      case 'distributor':
        data.value.distributors.push({ id, name, zoneIds: parentId ? [parentId] : [], areaIds: [] });
        if (parentId) {
          const zone = data.value.zones.find(z => z.id === parentId);
          if (zone) zone.distributorIds.push(id);
        }
        break;
      case 'area':
        data.value.areas.push({ id, name, distributorIds: parentId ? [parentId] : [], outletIds: [] });
        if (parentId) {
          const distributor = data.value.distributors.find(d => d.id === parentId);
          if (distributor) distributor.areaIds.push(id);
        }
        break;
      case 'outlet':
        data.value.outlets.push({ id, name, areaIds: parentId ? [parentId] : [] });
        if (parentId) {
          const area = data.value.areas.find(a => a.id === parentId);
          if (area) area.outletIds.push(id);
        }
        break;
    }
  };

  const removeEntity = (type: EntityType, id: string) => {
    switch (type) {
      case 'zone':
        // Remove from distributors
        data.value.distributors.forEach(d => {
          d.zoneIds = d.zoneIds.filter(zId => zId !== id);
        });
        data.value.zones = data.value.zones.filter(z => z.id !== id);
        break;
      case 'distributor':
        // Remove from zones and areas
        data.value.zones.forEach(z => {
          z.distributorIds = z.distributorIds.filter(dId => dId !== id);
        });
        data.value.areas.forEach(a => {
          a.distributorIds = a.distributorIds.filter(dId => dId !== id);
        });
        data.value.distributors = data.value.distributors.filter(d => d.id !== id);
        break;
      case 'area':
        // Remove from distributors and outlets
        data.value.distributors.forEach(d => {
          d.areaIds = d.areaIds.filter(aId => aId !== id);
        });
        data.value.outlets.forEach(o => {
          o.areaIds = o.areaIds.filter(aId => aId !== id);
        });
        data.value.areas = data.value.areas.filter(a => a.id !== id);
        break;
      case 'outlet':
        // Remove from areas
        data.value.areas.forEach(a => {
          a.outletIds = a.outletIds.filter(oId => oId !== id);
        });
        data.value.outlets = data.value.outlets.filter(o => o.id !== id);
        break;
    }
  };

  const getDistributorsByZone = (zoneId: string) => {
    const zone = data.value.zones.find(z => z.id === zoneId);
    if (!zone) return [];
    return data.value.distributors.filter(d => zone.distributorIds.includes(d.id));
  };

  const getAreasByDistributor = (distributorId: string) => {
    const distributor = data.value.distributors.find(d => d.id === distributorId);
    if (!distributor) return [];
    return data.value.areas.filter(a => distributor.areaIds.includes(a.id));
  };

  const getOutletsByArea = (areaId: string) => {
    const area = data.value.areas.find(a => a.id === areaId);
    if (!area) return [];
    return data.value.outlets.filter(o => area.outletIds.includes(o.id));
  };

  return {
    data: computed(() => data.value),
    expandedNodes: computed(() => expandedNodes.value),
    toggleNode,
    isExpanded,
    addEntity,
    removeEntity,
    getDistributorsByZone,
    getAreasByDistributor,
    getOutletsByArea,
  };
}