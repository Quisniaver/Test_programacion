<template>
  <div>
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4">Transacciones</h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          {{ transactions.length }} registros
        </p>
      </div>
      
      <div class="d-flex gap-2">
        <!-- Botón para crear nueva transacción -->
        <v-btn 
          color="primary" 
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Nueva Transacción
        </v-btn>
        
        <!-- Botón para subir PDF -->
        <input 
          type="file" 
          ref="pdfInput"
          accept=".pdf"
          @change="handlePdfUpload"
          style="display: none"
        />
        <v-btn 
          color="secondary" 
          prepend-icon="mdi-file-pdf"
          @click="triggerPdfUpload"
          :loading="uploadingPdf"
        >
          Subir PDF
        </v-btn>
        
        <v-btn 
          color="grey" 
          prepend-icon="mdi-refresh"
          @click="loadTransactions"
          :loading="loading"
        >
          Actualizar
        </v-btn>
      </div>
    </div>

    <!-- Tabla de transacciones -->
    <v-card elevation="2">
      <v-data-table
        :headers="headers"
        :items="transactions"
        :loading="loading"
        :items-per-page="10"
        class="elevation-1"
      >
        <!-- Celda de monto -->
        <template v-slot:item.monto="{ item }">
          <span class="font-weight-bold" :class="getAmountColor(item)">
            ${{ item.monto.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
          </span>
        </template>
        
        <!-- Celda de estado -->
        <template v-slot:item.estado="{ item }">
          <v-chip :color="getStatusColor(item.estado)" size="small" density="comfortable">
            {{ item.estado }}
          </v-chip>
        </template>
        
        <!-- Celda de acciones -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-pencil"
              size="small"
              color="primary"
              variant="text"
              @click="openEditDialog(item)"
            />
            <v-btn
              icon="mdi-delete"
              size="small"
              color="error"
              variant="text"
              @click="confirmDelete(item)"
            />
          </div>
        </template>
        
        <!-- Sin datos -->
        <template v-slot:no-data>
          <div class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1">mdi-database-off</v-icon>
            <p class="text-h6 mt-4">No hay transacciones</p>
            <p class="text-grey">Crea una nueva transacción o sube un PDF</p>
            <div class="d-flex justify-center gap-2 mt-4">
              <v-btn color="primary" @click="openCreateDialog">
                <v-icon left>mdi-plus</v-icon>
                Crear Transacción
              </v-btn>
              <v-btn color="secondary" @click="triggerPdfUpload">
                <v-icon left>mdi-file-pdf</v-icon>
                Subir PDF
              </v-btn>
            </div>
          </div>
        </template>
        
        <!-- Footer con estadísticas -->
        <template v-slot:bottom>
          <div class="d-flex justify-space-between align-center pa-3">
            <span class="text-caption text-grey">
              {{ transactions.length }} transacciones • 
              Total: ${{ totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2 }) }}
            </span>
            <div class="text-caption text-grey">
              <v-btn
                size="small"
                variant="text"
                color="primary"
                @click="exportToCSV"
                :loading="exporting"
              >
                <v-icon left small>mdi-download</v-icon>
                Exportar CSV
              </v-btn>
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo para crear/editar transacción -->
    <v-dialog v-model="showTransactionDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">
            {{ isEditing ? 'mdi-pencil' : 'mdi-plus' }}
          </v-icon>
          {{ isEditing ? 'Editar Transacción' : 'Nueva Transacción' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="transactionForm" v-model="formValid">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentTransaction.sourceId"
                  label="ID Fuente"
                  placeholder="INV-2025-001"
                  :rules="[v => !!v || 'El ID Fuente es requerido']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentTransaction.fecha"
                  label="Fecha"
                  type="date"
                  :rules="[v => !!v || 'La fecha es requerida']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentTransaction.categoria"
                  label="Categoría"
                  placeholder="Servicios, Compras, Ventas..."
                  :rules="[v => !!v || 'La categoría es requerida']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentTransaction.monto"
                  label="Monto"
                  type="number"
                  step="0.01"
                  prefix="$"
                  :rules="[
                    v => !!v || 'El monto es requerido',
                    v => v > 0 || 'El monto debe ser mayor a 0'
                  ]"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentTransaction.estado"
                  :items="estados"
                  label="Estado"
                  :rules="[v => !!v || 'El estado es requerido']"
                  required
                  variant="outlined"
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="currentTransaction.descripcion"
                  label="Descripción"
                  placeholder="Descripción de la transacción..."
                  rows="3"
                  :rules="[v => !!v || 'La descripción es requerida']"
                  required
                  variant="outlined"
                />
              </v-col>
            </v-row>
          </v-form>
          
          <v-alert v-if="formError" type="error" variant="tonal" class="mt-4">
            {{ formError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeTransactionDialog" variant="text">Cancelar</v-btn>
          <v-btn 
            color="primary" 
            @click="saveTransaction"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Actualizar' : 'Crear' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación para eliminar -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="error" class="mr-2">mdi-alert</v-icon>
          Confirmar Eliminación
        </v-card-title>
        
        <v-card-text>
          ¿Estás seguro de eliminar la transacción 
          <strong>{{ transactionToDelete?.sourceId }}</strong> por 
          ${{ transactionToDelete?.monto?.toLocaleString('es-ES') }}?
          <br><br>
          <span class="text-caption text-grey">Esta acción no se puede deshacer.</span>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDeleteDialog" variant="text">Cancelar</v-btn>
          <v-btn 
            color="error" 
            @click="deleteTransaction"
            :loading="deleting"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

   
    <v-dialog v-model="showPdfDialog" max-width="500">
    
    </v-dialog>

   
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import transactionsService, { 
  type Transaction, 
  type CreateTransactionDto,
  type UpdateTransactionDto 
} from '@/services/transaction.service';
import type { VForm } from 'vuetify/components';


const loading = ref(false)
const uploadingPdf = ref(false)
const saving = ref(false)
const deleting = ref(false)
const exporting = ref(false)
const formValid = ref(false)
const formError = ref('')
const transactions = ref<Transaction[]>([])

// Diálogos
const showTransactionDialog = ref(false)
const showDeleteDialog = ref(false)
const showPdfDialog = ref(false)
const showSnackbar = ref(false)

// Datos temporales
const currentTransaction = ref<CreateTransactionDto | (Transaction & { id?: number })>({
  sourceId: '',
  fecha: new Date().toISOString().split('T')[0], // Fecha actual
  categoria: '',
  monto: 0,
  estado: 'pendiente',
  descripcion: ''
})
const transactionToDelete = ref<Transaction | null>(null)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Refs
const transactionForm = ref<VForm>()
const pdfInput = ref<HTMLInputElement>()
const selectedPdf = ref<File | null>(null)
const uploadResult = ref<any>(null)

// Configuración
const estados = ['pendiente', 'activo', 'cancelado', 'completado']
const isEditing = computed(() => !!currentTransaction.value.id)

const headers = [
  { title: 'ID', key: 'id', width: '80px' },
  { title: 'ID Fuente', key: 'sourceId' },
  { title: 'Fecha', key: 'fecha' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Monto', key: 'monto', align: 'end' },
  { title: 'Estado', key: 'estado' },
  { title: 'Descripción', key: 'descripcion' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '120px' }
]

// Computed
const totalAmount = computed(() => {
  return transactions.value.reduce((sum, tx) => sum + tx.monto, 0)
})

// Métodos CRUD
const openCreateDialog = () => {
  currentTransaction.value = {
    sourceId: '',
    fecha: new Date().toISOString().split('T')[0],
    categoria: '',
    monto: 0,
    estado: 'pendiente',
    descripcion: ''
  }
  formError.value = ''
  showTransactionDialog.value = true
  nextTick(() => transactionForm.value?.resetValidation())
}

const openEditDialog = (transaction: Transaction) => {
  currentTransaction.value = { ...transaction }
  formError.value = ''
  showTransactionDialog.value = true
  nextTick(() => transactionForm.value?.resetValidation())
}

const closeTransactionDialog = () => {
  showTransactionDialog.value = false
  formError.value = ''
}

const saveTransaction = async () => {
  if (!formValid.value) return
  
  saving.value = true
  formError.value = ''
  
  try {
    if (isEditing.value) {
      const id = currentTransaction.value.id!
      const updateData: UpdateTransactionDto = { ...currentTransaction.value }
      delete (updateData as any).id
      
      const updated = await transactionsService.update(id, updateData)
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = updated
      }
      
      showSnackbarMessage('Transacción actualizada exitosamente', 'success')
    } else {
      const created = await transactionsService.create(currentTransaction.value as CreateTransactionDto)
      transactions.value.unshift(created)
      showSnackbarMessage('Transacción creada exitosamente', 'success')
    }
    
    closeTransactionDialog()
  } catch (error: any) {
    formError.value = error.message || 'Error al guardar la transacción'
    showSnackbarMessage(error.message || 'Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (transaction: Transaction) => {
  transactionToDelete.value = transaction
  showDeleteDialog.value = true
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  transactionToDelete.value = null
}

const deleteTransaction = async () => {
  if (!transactionToDelete.value) return
  
  deleting.value = true
  
  try {
    await transactionsService.delete(transactionToDelete.value.id)
    
    // Remover de la lista
    transactions.value = transactions.value.filter(
      t => t.id !== transactionToDelete.value!.id
    )
    
    showSnackbarMessage('Transacción eliminada exitosamente', 'success')
    closeDeleteDialog()
  } catch (error: any) {
    showSnackbarMessage(error.message || 'Error al eliminar', 'error')
  } finally {
    deleting.value = false
  }
}

// Métodos existentes (adaptados)
const loadTransactions = async () => {
  loading.value = true
  
  try {
    const data = await transactionsService.getAll()
    transactions.value = data
  } catch (error: any) {
    showSnackbarMessage(error.message || 'Error al cargar transacciones', 'error')
  } finally {
    loading.value = false
  }
}

const getStatusColor = (estado: string) => {
  switch (estado?.toLowerCase()) {
    case 'activo': return 'green'
    case 'completado': return 'blue'
    case 'cancelado': return 'red'
    case 'pendiente': return 'orange'
    default: return 'grey'
  }
}

const getAmountColor = (tx: Transaction) => {
  return tx.estado === 'cancelado' ? 'text-red' : 'text-green'
}


const triggerPdfUpload = () => {
  showPdfDialog.value = true
  uploadResult.value = null
  selectedPdf.value = null
}

const uploadPdf = async () => {
  if (!selectedPdf.value) return
  
  uploadingPdf.value = true
  uploadResult.value = null
  
  try {
    const savedTransactions = await transactionsService.uploadPdf(selectedPdf.value)
    
    uploadResult.value = {
      success: true,
      message: '✅ PDF procesado exitosamente',
      transactions: savedTransactions
    }
    
    await loadTransactions()
    
    setTimeout(() => {
      showPdfDialog.value = false
    }, 3000)
    
  } catch (error: any) {
    uploadResult.value = {
      success: false,
      message: `❌ Error: ${error.message || 'Error al procesar PDF'}`
    }
  } finally {
    uploadingPdf.value = false
  }
}

const handlePdfUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    selectedPdf.value = input.files[0]
    uploadPdf()
  }
}


const exportToCSV = async () => {
  exporting.value = true
  
  try {
    const csvContent = [
      ['ID', 'ID Fuente', 'Fecha', 'Categoría', 'Monto', 'Estado', 'Descripción'],
      ...transactions.value.map(tx => [
        tx.id,
        tx.sourceId,
        tx.fecha,
        tx.categoria,
        tx.monto,
        tx.estado,
        tx.descripcion
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showSnackbarMessage('CSV exportado exitosamente', 'success')
  } catch (error) {
    showSnackbarMessage('Error al exportar CSV', 'error')
  } finally {
    exporting.value = false
  }
}

const showSnackbarMessage = (message: string, color: 'success' | 'error' | 'info' = 'success') => {
  snackbarMessage.value = message
  snackbarColor.value = color
  showSnackbar.value = true
}


onMounted(async () => {
  await loadTransactions()
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
.gap-2 {
  gap: 8px;
}
.text-red {
  color: #f44336;
}
.text-green {
  color: #4caf50;
}
</style>