import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import VxvPaginator from './VxvPaginator.vue';

/**
 * VxvPaginator es un componente para navegar entre páginas de datos.
 * Proporciona controles de paginación con información sobre los elementos mostrados.
 */
const meta: Meta<typeof VxvPaginator> = {
  title: 'UI/Pagination/VxvPaginator',
  component: VxvPaginator,
  tags: ['autodocs'],
  argTypes: {
    currentPage: {
      description: 'Número de página actual',
      control: { type: 'number', min: 1 },
    },
    totalPages: {
      description: 'Número total de páginas',
      control: { type: 'number', min: 1 },
    },
    total: {
      description: 'Número total de elementos',
      control: { type: 'number', min: 0 },
    },
    perPage: {
      description: 'Número de elementos por página',
      control: { type: 'number', min: 1 },
    },
    maxVisibleButtons: {
      description: 'Número máximo de botones de página visibles',
      control: { type: 'number', min: 1 },
    },
    showInfo: {
      description: 'Muestra el texto informativo',
      control: { type: 'boolean' },
    },
    itemName: {
      description: 'Nombre de los elementos que se están paginando',
      control: { type: 'text' },
    },
    onPageChange: { action: 'page-change' },
  },
};

export default meta;
type Story = StoryObj<typeof VxvPaginator>;

/**
 * Paginador básico
 */
export const Default: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    total: 100,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: true,
    itemName: 'elementos',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador con muchas páginas
 */
export const ManyPages: Story = {
  args: {
    currentPage: 7,
    totalPages: 20,
    total: 200,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: true,
    itemName: 'elementos',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador en la primera página
 */
export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 10,
    total: 100,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: true,
    itemName: 'elementos',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador en la última página
 */
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    total: 100,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: true,
    itemName: 'elementos',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador con pocas páginas
 */
export const FewPages: Story = {
  args: {
    currentPage: 2,
    totalPages: 3,
    total: 30,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: true,
    itemName: 'elementos',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador sin información
 */
export const WithoutInfo: Story = {
  args: {
    currentPage: 3,
    totalPages: 10,
    total: 100,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: false,
    itemName: 'elementos',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador con nombre de elemento personalizado
 */
export const CustomItemName: Story = {
  args: {
    currentPage: 2,
    totalPages: 5,
    total: 50,
    perPage: 10,
    maxVisibleButtons: 5,
    showInfo: true,
    itemName: 'usuarios',
  },
  render: (args) => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(args.currentPage);
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
        args.onPageChange(page);
      };
      
      return { 
        ...args, 
        currentPage,
        handlePageChange
      };
    },
    template: `
      <vxv-paginator 
        :current-page="currentPage" 
        :total-pages="totalPages" 
        :total="total" 
        :per-page="perPage" 
        :max-visible-buttons="maxVisibleButtons" 
        :show-info="showInfo" 
        :item-name="itemName" 
        @page-change="handlePageChange" 
      />
    `,
  }),
};

/**
 * Paginador con diferentes cantidades de botones visibles
 */
export const DifferentVisibleButtons: Story = {
  render: () => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(5);
      const totalPages = 20;
      const total = 200;
      
      return { 
        currentPage,
        totalPages,
        total
      };
    },
    template: `
      <div class="space-y-8">
        <div>
          <h3 class="text-white mb-2">3 botones visibles:</h3>
          <vxv-paginator 
            :current-page="currentPage" 
            :total-pages="totalPages" 
            :total="total" 
            :per-page="10" 
            :max-visible-buttons="3" 
            item-name="elementos" 
          />
        </div>
        
        <div>
          <h3 class="text-white mb-2">5 botones visibles:</h3>
          <vxv-paginator 
            :current-page="currentPage" 
            :total-pages="totalPages" 
            :total="total" 
            :per-page="10" 
            :max-visible-buttons="5" 
            item-name="elementos" 
          />
        </div>
        
        <div>
          <h3 class="text-white mb-2">7 botones visibles:</h3>
          <vxv-paginator 
            :current-page="currentPage" 
            :total-pages="totalPages" 
            :total="total" 
            :per-page="10" 
            :max-visible-buttons="7" 
            item-name="elementos" 
          />
        </div>
      </div>
    `,
  }),
};

/**
 * Paginador interactivo
 */
export const Interactive: Story = {
  render: () => ({
    components: { VxvPaginator },
    setup() {
      const currentPage = ref(1);
      const totalPages = 10;
      const total = 100;
      const perPage = 10;
      
      const handlePageChange = (page: number) => {
        currentPage.value = page;
      };
      
      return { 
        currentPage,
        totalPages,
        total,
        perPage,
        handlePageChange
      };
    },
    template: `
      <div class="space-y-4">
        <div class="bg-gray-700 p-4 rounded">
          <h3 class="text-white mb-2">Página actual: {{ currentPage }}</h3>
          <p class="text-gray-300">Mostrando elementos {{ (currentPage - 1) * perPage + 1 }} a {{ Math.min(currentPage * perPage, total) }} de {{ total }}</p>
        </div>
        
        <vxv-paginator 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          :total="total" 
          :per-page="perPage" 
          :max-visible-buttons="5" 
          item-name="elementos" 
          @page-change="handlePageChange" 
        />
      </div>
    `,
  }),
};
