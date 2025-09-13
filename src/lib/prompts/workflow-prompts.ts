/**
 * Workflow FHIR Prompts
 * Clinical workflow and care process specific prompts
 */

import { FHIRPrompt, PromptProvider, PromptArguments } from './types.js';

export class WorkflowPrompts implements PromptProvider {
    private prompts: FHIRPrompt[];

    constructor() {
        this.prompts = [
            {
                id: 'workflow-admission',
                name: 'Patient Admission Workflow',
                description: 'Hospital admission and intake workflow guidance',
                prompt: `Focus on hospital admission workflow and FHIR resource orchestration:

**Admission Workflow Steps:**
1. **Pre-admission Planning**
   - Schedule admission with Appointment resource
   - Verify patient identity and insurance eligibility
   - Review existing conditions and medication lists
   - Coordinate with care teams and specialists

2. **Registration and Check-in**
   - Update Patient resource with current information
   - Create Encounter resource for admission episode
   - Verify emergency contacts and advance directives
   - Obtain necessary consents and authorizations

3. **Clinical Assessment**
   - Document initial assessments with Observation resources
   - Record admission diagnosis with Condition resources
   - Reconcile medications and create MedicationStatement
   - Establish care plans and treatment goals

4. **Care Team Assignment**
   - Assign attending physicians and care team members
   - Create CareTeam resource linking providers to patient
   - Establish communication preferences and protocols
   - Set up care coordination and handoff procedures

**Key FHIR Resources for Admission:**
- Patient: Demographics and identifiers
- Encounter: Admission episode and location
- Condition: Admission diagnosis and comorbidities
- MedicationStatement: Current medication reconciliation
- CareTeam: Assigned providers and care roles
- CarePlan: Treatment plans and care goals`,
                tags: ['workflow', 'admission', 'hospital', 'encounter'],
                context: {
                    workflow: 'admission',
                },
            },
            {
                id: 'workflow-discharge',
                name: 'Patient Discharge Workflow',
                description: 'Hospital discharge and care transition workflow',
                prompt: `Focus on hospital discharge workflow and care transitions:

**Discharge Planning Process:**
1. **Discharge Readiness Assessment**
   - Evaluate clinical stability and treatment response
   - Assess functional status and mobility needs
   - Review medication management capabilities
   - Coordinate with post-acute care providers

2. **Care Transition Planning**
   - Arrange follow-up appointments and referrals
   - Coordinate home care services or facility placement
   - Provide patient education and self-care instructions
   - Ensure medication access and pharmacy coordination

3. **Documentation and Communication**
   - Complete discharge summary with key clinical information
   - Provide medication reconciliation and discharge prescriptions
   - Communicate care plan to receiving providers
   - Schedule follow-up contacts and monitoring

4. **Post-discharge Monitoring**
   - Implement readmission prevention strategies
   - Monitor patient adherence and clinical status
   - Coordinate transitions of care communications
   - Track outcomes and quality metrics

**Key FHIR Resources for Discharge:**
- Encounter: Discharge disposition and timing
- Condition: Final diagnoses and clinical status
- MedicationRequest: Discharge medications and prescriptions
- Appointment: Follow-up care scheduling
- DocumentReference: Discharge summary and care instructions
- Task: Post-discharge follow-up and monitoring activities`,
                tags: ['workflow', 'discharge', 'care-transition', 'follow-up'],
                context: {
                    workflow: 'discharge',
                },
            },
            {
                id: 'workflow-medication-management',
                name: 'Medication Management Workflow',
                description: 'Comprehensive medication management and safety workflow',
                prompt: `Focus on medication management workflow and patient safety:

**Medication Management Process:**
1. **Medication Reconciliation**
   - Compare current medications across care settings
   - Identify discrepancies and potential duplications
   - Verify medication accuracy with patient and caregivers
   - Document changes and rationale for modifications

2. **Prescribing and Ordering**
   - Review clinical indications and contraindications
   - Check for drug-drug interactions and allergies
   - Calculate appropriate dosing based on patient factors
   - Provide clear instructions for administration

3. **Medication Administration**
   - Verify patient identity and medication accuracy
   - Document administration timing and response
   - Monitor for adverse reactions and side effects
   - Ensure proper storage and handling procedures

4. **Monitoring and Follow-up**
   - Track medication adherence and effectiveness
   - Monitor laboratory values and clinical indicators
   - Assess for therapeutic response and adverse events
   - Adjust dosing and therapy based on patient response

**Safety Considerations:**
- Implement five rights of medication administration
- Use barcode scanning and electronic verification
- Maintain allergy and adverse reaction documentation
- Provide patient education and counseling
- Support medication adherence and compliance

**Key FHIR Resources:**
- MedicationRequest: Prescriptions and orders
- MedicationAdministration: Administration records
- MedicationStatement: Current medication status
- AllergyIntolerance: Drug allergies and reactions
- Observation: Monitoring results and therapeutic levels`,
                tags: ['workflow', 'medication', 'safety', 'prescribing'],
                context: {
                    workflow: 'medication-management',
                },
            },
            {
                id: 'workflow-diagnostic-testing',
                name: 'Diagnostic Testing Workflow',
                description: 'Laboratory and diagnostic testing workflow management',
                prompt: `Focus on diagnostic testing workflow and result management:

**Diagnostic Testing Process:**
1. **Test Ordering and Planning**
   - Assess clinical indications for diagnostic testing
   - Select appropriate tests based on clinical guidelines
   - Coordinate test scheduling and patient preparation
   - Provide pre-test instructions and education

2. **Specimen Collection and Processing**
   - Verify patient identity and test orders
   - Follow proper collection procedures and protocols
   - Ensure specimen integrity and chain of custody
   - Coordinate with laboratory and imaging services

3. **Result Processing and Interpretation**
   - Review results for accuracy and completeness
   - Interpret findings in clinical context
   - Identify critical values requiring immediate action
   - Coordinate with specialists for complex interpretations

4. **Result Communication and Follow-up**
   - Communicate results to patients and care teams
   - Provide interpretation and clinical significance
   - Coordinate follow-up testing and interventions
   - Document result review and clinical decisions

**Quality and Safety Measures:**
- Implement proper specimen handling procedures
- Use standardized reference ranges and units
- Provide timely result reporting and notifications
- Maintain result accuracy and quality control
- Support clinical decision-making with interpretive guidance

**Key FHIR Resources:**
- ServiceRequest: Test orders and requisitions
- Specimen: Sample collection and handling
- DiagnosticReport: Test results and interpretations
- Observation: Individual test measurements
- Task: Follow-up actions and interventions`,
                tags: ['workflow', 'diagnostic', 'laboratory', 'testing'],
                context: {
                    workflow: 'diagnostic-testing',
                },
            },
            {
                id: 'workflow-care-coordination',
                name: 'Care Coordination Workflow',
                description: 'Multi-provider care coordination and communication',
                prompt: `Focus on care coordination workflow across providers and settings:

**Care Coordination Process:**
1. **Care Team Formation**
   - Identify all providers involved in patient care
   - Define roles, responsibilities, and communication protocols
   - Establish care coordination lead and primary contacts
   - Create shared care plans and treatment goals

2. **Information Sharing**
   - Maintain current and accurate patient information
   - Share relevant clinical data across care teams
   - Coordinate care transitions and handoffs
   - Ensure continuity of care documentation

3. **Communication and Collaboration**
   - Establish regular communication schedules
   - Use secure messaging and collaboration tools
   - Coordinate care decisions and treatment modifications
   - Resolve conflicts and address care gaps

4. **Care Plan Management**
   - Develop comprehensive care plans with all providers
   - Monitor progress toward care goals and outcomes
   - Adjust care plans based on patient response
   - Coordinate care transitions and referrals

**Coordination Challenges:**
- Managing multiple provider schedules and availability
- Ensuring timely and accurate information exchange
- Coordinating care across different health systems
- Maintaining patient engagement and shared decision-making
- Addressing social determinants and barriers to care

**Key FHIR Resources:**
- CareTeam: Multi-disciplinary care team members
- CarePlan: Coordinated care plans and goals
- Communication: Secure messaging between providers
- Task: Care coordination activities and assignments
- Encounter: Care episodes across different settings`,
                tags: ['workflow', 'care-coordination', 'team-based-care', 'communication'],
                context: {
                    workflow: 'care-coordination',
                },
            },
            {
                id: 'workflow-emergency-care',
                name: 'Emergency Care Workflow',
                description: 'Emergency department workflow and acute care management',
                prompt: `Focus on emergency department workflow and acute care processes:

**Emergency Care Process:**
1. **Triage and Initial Assessment**
   - Rapidly assess acuity and prioritize care needs
   - Obtain essential patient history and vital signs
   - Identify immediate life-threatening conditions
   - Initiate emergency protocols and interventions

2. **Diagnostic Workup**
   - Order appropriate diagnostic tests and imaging
   - Coordinate urgent laboratory and radiology studies
   - Interpret results in context of clinical presentation
   - Consult specialists for complex cases

3. **Treatment and Stabilization**
   - Implement evidence-based emergency treatments
   - Monitor patient response and vital signs
   - Administer medications and interventions safely
   - Coordinate with specialists and support services

4. **Disposition and Care Transitions**
   - Determine appropriate disposition (discharge, admission, transfer)
   - Coordinate care transitions and handoffs
   - Provide discharge instructions and follow-up care
   - Ensure continuity of care documentation

**Emergency Care Priorities:**
- Rapid recognition and treatment of life-threatening conditions
- Efficient use of diagnostic resources and time
- Clear communication with patients and families
- Coordination with emergency medical services and receiving facilities
- Documentation of care decisions and clinical reasoning

**Key FHIR Resources:**
- Encounter: Emergency visit and triage information
- Observation: Vital signs and clinical assessments
- Condition: Emergency diagnoses and clinical findings
- Procedure: Emergency interventions and treatments
- DiagnosticReport: Urgent laboratory and imaging results`,
                tags: ['workflow', 'emergency', 'acute-care', 'triage'],
                context: {
                    workflow: 'emergency-care',
                },
            },
        ];
    }

    public getPrompts(): FHIRPrompt[] {
        return this.prompts;
    }

    public getPrompt(id: string): FHIRPrompt | undefined {
        return this.prompts.find(prompt => prompt.id === id);
    }

    public generatePrompt(id: string, args: PromptArguments = {}): string {
        const prompt = this.getPrompt(id);
        
        if (!prompt) {
            throw new Error(`Workflow prompt not found: ${id}`);
        }

        return this.interpolatePrompt(prompt.prompt, args);
    }

    private interpolatePrompt(template: string, args: PromptArguments): string {
        let result = template;

        for (const [key, value] of Object.entries(args)) {
            const placeholder = `{{${key}}}`;
            const replacement = typeof value === 'string' ? value : JSON.stringify(value);
            result = result.replace(new RegExp(placeholder, 'g'), replacement);
        }

        return result.trim();
    }
}