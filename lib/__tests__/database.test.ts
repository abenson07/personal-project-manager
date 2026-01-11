import {
  createProject,
  getProjectById,
  getProjectsByPhase,
  updateProject,
  deleteProject,
  createProjectNote,
  getProjectNotes,
  createAsset,
  getAssetsByProject,
  createFeatureSet,
  getFeatureSetsByProject,
  updateFeatureSet,
  createFeatureVersion,
  createMiniPRD,
  getMiniPRDsByProject,
  updateMiniPRDStatus,
  createMiniPRDTask,
  updateMiniPRDTask,
  createTest,
  getTestsByMiniPRD,
  DatabaseError
} from '../database'
import { ProjectPhase, AssetType, MiniPRDStatus, TaskType, TestType } from '@/types/database'

describe('Database Utilities', () => {
  let testProjectId: string
  let testFeatureSetId: string
  let testMiniPRDId: string

  beforeAll(async () => {
    // Create a test project
    const project = await createProject('Test Project', ProjectPhase.CONCEPT)
    testProjectId = project.id

    // Create a test feature set
    const featureSet = await createFeatureSet(testProjectId, 'Test Feature Set', 'Test description')
    testFeatureSetId = featureSet.id

    // Create a test mini PRD
    const miniPRD = await createMiniPRD(
      testProjectId,
      testFeatureSetId,
      'v1.0',
      'Test content',
      MiniPRDStatus.PLANNED
    )
    testMiniPRDId = miniPRD.id
  })

  afterAll(async () => {
    // Clean up test data
    if (testProjectId) {
      await deleteProject(testProjectId)
    }
  })

  describe('Project operations', () => {
    it('should create a project', async () => {
      const project = await createProject('New Test Project', ProjectPhase.CONCEPT)
      expect(project).toBeDefined()
      expect(project.name).toBe('New Test Project')
      expect(project.phase).toBe(ProjectPhase.CONCEPT)
      
      // Clean up
      await deleteProject(project.id)
    })

    it('should get project by id', async () => {
      const project = await getProjectById(testProjectId)
      expect(project).toBeDefined()
      expect(project?.id).toBe(testProjectId)
    })

    it('should get projects by phase', async () => {
      const projects = await getProjectsByPhase(ProjectPhase.CONCEPT)
      expect(Array.isArray(projects)).toBe(true)
      expect(projects.length).toBeGreaterThan(0)
    })

    it('should update project', async () => {
      const updated = await updateProject(testProjectId, { name: 'Updated Test Project' })
      expect(updated.name).toBe('Updated Test Project')
      
      // Restore original name
      await updateProject(testProjectId, { name: 'Test Project' })
    })

    it('should handle invalid project id', async () => {
      const project = await getProjectById('00000000-0000-0000-0000-000000000000')
      expect(project).toBeNull()
    })
  })

  describe('Project Notes operations', () => {
    it('should create a project note', async () => {
      const note = await createProjectNote(testProjectId, 'Test note content')
      expect(note).toBeDefined()
      expect(note.content).toBe('Test note content')
      expect(note.project_id).toBe(testProjectId)
    })

    it('should get project notes', async () => {
      const notes = await getProjectNotes(testProjectId)
      expect(Array.isArray(notes)).toBe(true)
    })
  })

  describe('Asset operations', () => {
    it('should create an asset', async () => {
      const asset = await createAsset(testProjectId, AssetType.IMAGE, 'https://example.com/image.jpg', 'Test image')
      expect(asset).toBeDefined()
      expect(asset.type).toBe(AssetType.IMAGE)
      expect(asset.source).toBe('https://example.com/image.jpg')
    })

    it('should get assets by project', async () => {
      const assets = await getAssetsByProject(testProjectId)
      expect(Array.isArray(assets)).toBe(true)
    })
  })

  describe('Feature Set operations', () => {
    it('should create a feature set', async () => {
      const featureSet = await createFeatureSet(testProjectId, 'New Feature Set', 'Description')
      expect(featureSet).toBeDefined()
      expect(featureSet.name).toBe('New Feature Set')
    })

    it('should get feature sets by project', async () => {
      const featureSets = await getFeatureSetsByProject(testProjectId)
      expect(Array.isArray(featureSets)).toBe(true)
      expect(featureSets.length).toBeGreaterThan(0)
    })

    it('should update feature set', async () => {
      const updated = await updateFeatureSet(testFeatureSetId, { name: 'Updated Feature Set' })
      expect(updated.name).toBe('Updated Feature Set')
    })
  })

  describe('Feature Version operations', () => {
    it('should create a feature version', async () => {
      const version = await createFeatureVersion(testFeatureSetId, 'v1.0', 'Version definition')
      expect(version).toBeDefined()
      expect(version.version).toBe('v1.0')
    })
  })

  describe('Mini PRD operations', () => {
    it('should create a mini PRD', async () => {
      const miniPRD = await createMiniPRD(
        testProjectId,
        testFeatureSetId,
        'v2.0',
        'New PRD content',
        MiniPRDStatus.PLANNED
      )
      expect(miniPRD).toBeDefined()
      expect(miniPRD.status).toBe(MiniPRDStatus.PLANNED)
    })

    it('should get mini PRDs by project', async () => {
      const miniPRDs = await getMiniPRDsByProject(testProjectId)
      expect(Array.isArray(miniPRDs)).toBe(true)
      expect(miniPRDs.length).toBeGreaterThan(0)
    })

    it('should update mini PRD status', async () => {
      const updated = await updateMiniPRDStatus(testMiniPRDId, MiniPRDStatus.IN_DEVELOPMENT)
      expect(updated.status).toBe(MiniPRDStatus.IN_DEVELOPMENT)
    })
  })

  describe('Mini PRD Task operations', () => {
    it('should create a mini PRD task', async () => {
      const task = await createMiniPRDTask(testMiniPRDId, TaskType.DEVELOPMENT, 'Test task')
      expect(task).toBeDefined()
      expect(task.type).toBe(TaskType.DEVELOPMENT)
      expect(task.completed).toBe(false)
    })

    it('should update mini PRD task', async () => {
      const task = await createMiniPRDTask(testMiniPRDId, TaskType.DEVELOPMENT, 'Task to update')
      const updated = await updateMiniPRDTask(task.id, true)
      expect(updated.completed).toBe(true)
    })
  })

  describe('Test operations', () => {
    it('should create a test', async () => {
      const test = await createTest(testMiniPRDId, TestType.UNIT, 'Test description')
      expect(test).toBeDefined()
      expect(test.test_type).toBe(TestType.UNIT)
    })

    it('should get tests by mini PRD', async () => {
      const tests = await getTestsByMiniPRD(testMiniPRDId)
      expect(Array.isArray(tests)).toBe(true)
    })
  })
})

